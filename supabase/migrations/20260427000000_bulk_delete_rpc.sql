-- Atomic bulk delete with integrated rate limiting
--
-- Replaces the two-step frontend pattern (check rate limit via edge function,
-- then fire N individual DELETEs) with a single atomic RPC that:
--   1. Checks and increments the bulk_delete rate limit counter atomically.
--   2. Deletes all requested consultation IDs in one statement.
--
-- This eliminates:
--   - Fix 6: TOCTOU race condition (check and delete are now in one transaction)
--   - Fix 17: N sequential DELETE queries (replaced by a single WHERE id = ANY(ids))

CREATE OR REPLACE FUNCTION public.bulk_delete_with_rate_limit(ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_allowed       boolean;
    v_window_start  timestamptz;
BEGIN
    -- Calculate the current 5-minute window start, matching the edge function's
    -- getCurrentWindowStart(windowMs) logic: floor(now_epoch / window_secs) * window_secs
    v_window_start := to_timestamp(floor(extract(epoch from now()) / 300) * 300);

    -- Atomically increment the counter and check the limit.
    -- bulk_delete: max 10 requests per 5-minute window (matches config.ts).
    SELECT allowed INTO v_allowed
    FROM public.check_and_increment_rate_limit(
        auth.uid(),
        'bulk_delete',
        v_window_start,
        10
    );

    IF NOT v_allowed THEN
        RETURN jsonb_build_object('error', 'RATE_LIMIT_EXCEEDED');
    END IF;

    -- Single DELETE for all IDs. SECURITY DEFINER bypasses RLS, so we enforce
    -- ownership explicitly with user_id = auth.uid().
    DELETE FROM public.consultations
    WHERE id = ANY(ids)
      AND user_id = auth.uid();

    RETURN jsonb_build_object('deleted', array_length(ids, 1));
END;
$$;

-- Grant execution to authenticated users (called directly from the JS client).
-- SECURITY DEFINER means the function runs as its owner (postgres), so it can
-- call check_and_increment_rate_limit and write to rate_limits without needing
-- service_role grants on the caller side.
GRANT EXECUTE ON FUNCTION public.bulk_delete_with_rate_limit(uuid[]) TO authenticated;
