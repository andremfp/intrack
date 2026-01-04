-- Enable RLS on specialties table and restrict to authenticated users only
-- This addresses the security warning about public.specialties being exposed without RLS

-- Enable Row Level Security on specialties table
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Create policy allowing only authenticated users to read specialties
CREATE POLICY "specialties_authenticated_select" ON public.specialties
    FOR SELECT
    TO authenticated
    USING (true);

-- Revoke all permissions from anonymous users
REVOKE ALL ON TABLE public.specialties FROM anon;

-- Ensure authenticated users only have SELECT permission
REVOKE ALL ON TABLE public.specialties FROM authenticated;
GRANT SELECT ON TABLE public.specialties TO authenticated;
