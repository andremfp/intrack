-- Create rate limiting table for distributed rate limiting
-- This table stores request counters for different operations per user per time window

CREATE TABLE public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_type text NOT NULL, -- 'import', 'export', 'report', 'bulk_delete'
    window_start timestamp with time zone NOT NULL,
    request_count integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, operation_type, window_start)
);

-- Create index for efficient rate limit lookups
CREATE INDEX idx_rate_limits_user_operation_window ON public.rate_limits(user_id, operation_type, window_start);

-- Create index for cleanup operations (by window_start)
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Row Level Security policies
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own rate limit records
CREATE POLICY "Users can view their own rate limit records" ON public.rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all rate limit records (for Edge Functions)
CREATE POLICY "Service role can manage rate limit records" ON public.rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.rate_limits IS 'Stores rate limiting counters for user operations';
COMMENT ON COLUMN public.rate_limits.user_id IS 'Reference to the user who performed the operation';
COMMENT ON COLUMN public.rate_limits.operation_type IS 'Type of operation being rate limited (import, export, report, bulk_delete)';
COMMENT ON COLUMN public.rate_limits.window_start IS 'Start time of the rate limiting window';
COMMENT ON COLUMN public.rate_limits.request_count IS 'Number of requests made in this window';
