-- Add alcohol, drugs, and professional_situation fields to consultations_mgf view
-- These fields are stored in the details JSONB column and need to be exposed as top-level columns
DROP VIEW IF EXISTS "public"."consultations_mgf";

CREATE VIEW "public"."consultations_mgf" AS
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
