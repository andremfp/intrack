-- Migrate referrence field to paired format (specialty → motives)
--
-- Old format:
--   details->'referrence'        = ["cardio", "endocrino"]
--   details->'referrence_motive' = ["D11 - Diarreia", "A01 - Dor"]
--
-- New format:
--   details->'referrence' = [{"cardio": ["D11 - Diarreia", "A01 - Dor"]},
--                             {"endocrino": ["D11 - Diarreia", "A01 - Dor"]}]
--
-- Since the old schema had no per-specialty link, all existing motives are attached to
-- every referrence specialty. Users should review migrated entries and correct duplicates.
--
-- Deploy order: run this migration BEFORE deploying the new application code.

BEGIN;

-- Preview rows that will be transformed (uncomment to inspect before applying)
-- SELECT
--   id,
--   details->'referrence'        AS old_referrence,
--   details->'referrence_motive' AS old_motive,
--   (
--     SELECT COALESCE(
--       jsonb_agg(
--         jsonb_build_object(spec, COALESCE(details->'referrence_motive', '[]'::jsonb))
--       ),
--       '[]'::jsonb
--     )
--     FROM jsonb_array_elements_text(details->'referrence') AS spec
--   ) AS new_referrence
-- FROM public.consultations
-- WHERE
--   details ? 'referrence_motive'
--   OR (
--     details->'referrence' IS NOT NULL
--     AND jsonb_typeof(details->'referrence') = 'array'
--     AND jsonb_array_length(details->'referrence') > 0
--     AND jsonb_typeof(details->'referrence'->0) = 'string'
--   );

-- Step 1: Transform referrence from string-array to paired object-array format,
--         removing referrence_motive in the same operation.
--         Condition detects old format by checking the first element is a string (not an object).
UPDATE public.consultations
SET details = jsonb_set(
  details - 'referrence_motive',
  '{referrence}',
  (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(spec, COALESCE(details->'referrence_motive', '[]'::jsonb))
      ),
      '[]'::jsonb
    )
    FROM jsonb_array_elements_text(details->'referrence') AS spec
  )
)
WHERE
  jsonb_typeof(details->'referrence') = 'array'
  AND CASE WHEN jsonb_typeof(details->'referrence') = 'array'
           THEN jsonb_array_length(details->'referrence') > 0
           ELSE false END
  AND CASE WHEN jsonb_typeof(details->'referrence') = 'array'
            AND jsonb_array_length(details->'referrence') > 0
           THEN jsonb_typeof(details->'referrence'->0) = 'string'
           ELSE false END;

-- Step 2: Remove referrence_motive from any remaining rows
--         (e.g. null or empty referrence that were skipped by step 1).
UPDATE public.consultations
SET details = details - 'referrence_motive'
WHERE details ? 'referrence_motive';

COMMIT;
