-- Fix security issues identified by Supabase security scanner
-- 1. Fix consultations_mgf view to use SECURITY INVOKER
-- 2. Fix update_updated_at_column function to set search_path
-- 3. Fix rate_limits RLS policies to optimize auth function calls
-- 4. Fix multiple permissive policies on rate_limits table

-- 1. Recreate consultations_mgf view with SECURITY INVOKER
-- This ensures the view respects Row Level Security policies on the underlying consultations table
DROP VIEW IF EXISTS "public"."consultations_mgf";

CREATE VIEW "public"."consultations_mgf"
WITH (security_invoker = true) AS
 SELECT c.id,
    c.user_id,
    c.specialty_year,
    c.age,
    c.age_unit,
    c.date,
    c.sex,
    c.process_number,
    c.autonomy,
    c.location,
    c.favorite,
    (c.details ->> 'type'::text) AS type,
    ((c.details ->> 'presential'::text))::boolean AS presential,
    (c.details ->> 'smoker'::text) AS smoker,
    ((c.details ->> 'vaccination_plan'::text))::boolean AS vaccination_plan,
    (c.details ->> 'family_type'::text) AS family_type,
    (c.details ->> 'school_level'::text) AS school_level,
    (c.details ->> 'professional_situation'::text) AS professional_situation,
    ((c.details ->> 'alcohol'::text))::boolean AS alcohol,
    ((c.details ->> 'drugs'::text))::boolean AS drugs,
    c.details,
    c.created_at,
    c.updated_at
   FROM (public.consultations c
     JOIN public.specialties s ON ((s.id = c.specialty_id)))
  WHERE (s.code = 'mgf'::text);

-- Change ownership back to postgres (standard for Supabase)
ALTER VIEW public.consultations_mgf OWNER TO postgres;

-- Tighten permissions: revoke all from anon and only grant SELECT where needed
REVOKE ALL ON TABLE public.consultations_mgf FROM anon;

-- Ensure authenticated users only have SELECT permission on the view
REVOKE ALL ON TABLE public.consultations_mgf FROM authenticated;
GRANT SELECT ON TABLE public.consultations_mgf TO authenticated;

-- 2. Fix update_updated_at_column function to set search_path
-- This prevents search_path injection attacks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 3 & 4. Fix rate_limits RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own rate limit records" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage rate limit records" ON public.rate_limits;

-- Recreate policies with optimized auth function calls using subqueries
-- This prevents re-evaluation of auth functions for each row

-- Users can only access their own rate limit records (SELECT only)
-- Using subquery to optimize performance: (SELECT auth.uid()) instead of auth.uid()
CREATE POLICY "Users can view their own rate limit records" ON public.rate_limits
    FOR SELECT 
    USING ((SELECT auth.uid()) = user_id);

-- Service role can manage rate limit records (INSERT, UPDATE, DELETE only, not SELECT)
-- Split into separate policies to avoid multiple permissive policies for the same action
-- Using subqueries to optimize performance: (SELECT auth.role()) instead of auth.role()
CREATE POLICY "Service role can insert rate limit records" ON public.rate_limits
    FOR INSERT
    WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can update rate limit records" ON public.rate_limits
    FOR UPDATE
    USING ((SELECT auth.role()) = 'service_role')
    WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Service role can delete rate limit records" ON public.rate_limits
    FOR DELETE
    USING ((SELECT auth.role()) = 'service_role');
