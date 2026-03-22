-- Atomic rate limit check-and-increment function
--
-- Replaces the SELECT + UPSERT two-step in the edge function with a single
-- atomic operation, eliminating the race condition where concurrent requests
-- can both read the same count, both pass the limit check, and both increment.

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
    p_user_id uuid,
    p_operation_type text,
    p_window_start timestamptz,
    p_max_requests integer
)
RETURNS TABLE(allowed boolean, request_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count integer;
BEGIN
    -- Atomically insert a new window record or increment an existing one.
    -- RETURNING captures the post-update count so we never need a separate SELECT.
    INSERT INTO public.rate_limits (user_id, operation_type, window_start, request_count, updated_at)
    VALUES (p_user_id, p_operation_type, p_window_start, 1, now())
    ON CONFLICT (user_id, operation_type, window_start)
    DO UPDATE SET
        request_count = public.rate_limits.request_count + 1,
        updated_at = now()
    RETURNING public.rate_limits.request_count INTO v_count;

    -- Increment before checking: each concurrent request gets a unique count
    -- value, so the limit is exact even under high concurrency.
    RETURN QUERY SELECT (v_count <= p_max_requests), v_count;
END;
$$;

-- Restrict execution to the service role (used by the rate-limit edge function).
-- SECURITY DEFINER means the function runs with the owner's privileges, so
-- limiting callers is important to prevent privilege escalation.
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(uuid, text, timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(uuid, text, timestamptz, integer) TO service_role;

-- Scheduled cleanup of expired rate limit records
--
-- Requires the pg_cron extension (available on all paid Supabase plans and local dev).
-- Must also be enabled in the Supabase dashboard under Extensions before running in production.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Delete records older than 2 hours every hour.
-- The longest rate limit window is 1 hour (import/export/report), so 2 hours
-- gives a safe buffer: no active window's data is deleted prematurely.
SELECT cron.schedule(
    'cleanup-expired-rate-limits',
    '0 * * * *',
    $$DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '2 hours'$$
);
