-- Recreate consultations_mgf view with SECURITY INVOKER to respect base table RLS
-- This addresses the security warning about definer-like behavior in the view

-- Recreate the view with security_invoker = true using CREATE OR REPLACE
-- This ensures the view respects Row Level Security policies on the underlying consultations table
-- Includes all fields from the latest view definition (including vaccination_plan, family_type, school_level)
-- Note: Using CREATE OR REPLACE VIEW for safer atomic updates
CREATE OR REPLACE VIEW public.consultations_mgf
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
