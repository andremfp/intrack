-- ============================================================================
-- Migrate type-specific section keys in consultation details JSONB
-- ============================================================================
--
-- DM consultations
-- ----------------
-- Old structure (produced by the buggy code - dm_exams and hta_exams were
-- both written with the shared exam fields due to key collision in formValues):
--
--   dm.dm_exams.{creatinina, ldl, tfg, score2, albuminuria}  <- shared exams
--   dm.hta_exams.{creatinina, ldl, tfg, score2, albuminuria} <- duplicate of above
--   dm.dm_history.{medicamentos, complicacoes}
--   dm.hta_history.{medicamentos, complicacoes}
--
-- New structure:
--   dm.exams.{creatinina, ldl, tfg, score2, albuminuria}     <- shared exams
--   dm.dm_exams.{hba1c}                                      <- DM-specific (new field)
--   dm.history.{medicamentos, complicacoes}                  <- DM history
--   dm.hta_history.{hta_medicamentos, hta_complicacoes}      <- HTA history (prefixed keys
--                                                               to avoid formValues collision)
--
-- SA consultations
-- ----------------
-- Old structure:  sa.history.{medicamentos, complicacoes}
-- New structure:  sa.hta_history.{medicamentos, complicacoes}
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- DM: rebuild dm object preserving any non-section keys, then add renamed
-- sections. Uses jsonb_each + jsonb_object_agg to remove old section keys
-- without the - operator (avoids operator resolution issues on sub-expressions).
-- ----------------------------------------------------------------------------
WITH dm_rebuilt AS (
  SELECT
    c.id,
    (
      -- Carry over any keys outside the four old section keys
      SELECT COALESCE(jsonb_object_agg(key, value), '{}')
      FROM jsonb_each(c.details->'dm')
      WHERE key NOT IN ('dm_exams', 'hta_exams', 'dm_history', 'hta_history')
    )
    -- dm_exams (old shared exams) -> exams; hta_exams is dropped (duplicate artifact)
    || jsonb_build_object('exams', COALESCE(c.details->'dm'->'dm_exams', '{}'))
    -- dm_history -> history
    || CASE
         WHEN c.details->'dm'->'dm_history' IS NOT NULL
         THEN jsonb_build_object('history', c.details->'dm'->'dm_history')
         ELSE '{}'::jsonb
       END
    -- hta_history field keys get hta_ prefix to avoid formValues collision with history
    || CASE
         WHEN c.details->'dm'->'hta_history' IS NOT NULL
         THEN jsonb_build_object('hta_history', jsonb_build_object(
           'hta_medicamentos', c.details->'dm'->'hta_history'->'medicamentos',
           'hta_complicacoes',  c.details->'dm'->'hta_history'->'complicacoes'
         ))
         ELSE '{}'::jsonb
       END
    AS new_dm
  FROM public.consultations c
  WHERE c.details->>'type' = 'DM'
    AND c.details ? 'dm'
)
UPDATE public.consultations c
SET details = c.details || jsonb_build_object('dm', d.new_dm)
FROM dm_rebuilt d
WHERE c.id = d.id;

-- ----------------------------------------------------------------------------
-- SA: rebuild sa object preserving all non-history keys (e.g. exams),
-- renaming history -> hta_history.
-- ----------------------------------------------------------------------------
WITH sa_rebuilt AS (
  SELECT
    c.id,
    (
      -- Carry over any keys outside the old history section
      SELECT COALESCE(jsonb_object_agg(key, value), '{}')
      FROM jsonb_each(c.details->'sa')
      WHERE key != 'history'
    )
    || CASE
         WHEN c.details->'sa'->'history' IS NOT NULL
         THEN jsonb_build_object('hta_history', c.details->'sa'->'history')
         ELSE '{}'::jsonb
       END
    AS new_sa
  FROM public.consultations c
  WHERE c.details->>'type' = 'SA'
    AND c.details ? 'sa'
)
UPDATE public.consultations c
SET details = c.details || jsonb_build_object('sa', s.new_sa)
FROM sa_rebuilt s
WHERE c.id = s.id;

COMMIT;
