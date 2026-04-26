-- Add age_years computed column to consultations_mgf view
-- This allows Postgres to sort by age natively, avoiding a full table fetch
-- and JavaScript in-memory sort for age-based ordering.
--
-- age_years converts the stored (age, age_unit) pair to a float in years so
-- the database can ORDER BY age_years directly.

DROP VIEW IF EXISTS "public"."consultations_mgf";

CREATE VIEW "public"."consultations_mgf"
WITH (security_invoker = true) AS
 SELECT c.id,
    c.user_id,
    c.specialty_year,
    c.age,
    c.age_unit,
    CASE c.age_unit
      WHEN 'days'   THEN c.age / 365.25
      WHEN 'weeks'  THEN c.age / 52.1429
      WHEN 'months' THEN c.age / 12.0
      ELSE c.age::float
    END AS age_years,
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

ALTER VIEW public.consultations_mgf OWNER TO postgres;

REVOKE ALL ON TABLE public.consultations_mgf FROM anon;
REVOKE ALL ON TABLE public.consultations_mgf FROM authenticated;
GRANT SELECT ON TABLE public.consultations_mgf TO authenticated;
