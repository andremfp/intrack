-- Fix 20: Add size constraints to the consultations.details JSONB column.
-- Prevents unbounded data insertion via direct API calls that bypass UI field limits.

ALTER TABLE consultations
  -- Overall 64KB cap per row
  ADD CONSTRAINT details_max_size
    CHECK (pg_column_size(details) <= 65536),

  -- Per-array caps (max 20 items each).
  -- Each expression guards against missing keys or non-array values.
  ADD CONSTRAINT details_problems_max_items
    CHECK (details->'problems' IS NULL OR jsonb_typeof(details->'problems') != 'array' OR jsonb_array_length(details->'problems') <= 20),

  ADD CONSTRAINT details_diagnosis_max_items
    CHECK (details->'diagnosis' IS NULL OR jsonb_typeof(details->'diagnosis') != 'array' OR jsonb_array_length(details->'diagnosis') <= 20),

  ADD CONSTRAINT details_new_diagnosis_max_items
    CHECK (details->'new_diagnosis' IS NULL OR jsonb_typeof(details->'new_diagnosis') != 'array' OR jsonb_array_length(details->'new_diagnosis') <= 20),

  ADD CONSTRAINT details_referrence_max_items
    CHECK (details->'referrence' IS NULL OR jsonb_typeof(details->'referrence') != 'array' OR jsonb_array_length(details->'referrence') <= 20),

  ADD CONSTRAINT details_chronic_diseases_max_items
    CHECK (details->'chronic_diseases' IS NULL OR jsonb_typeof(details->'chronic_diseases') != 'array' OR jsonb_array_length(details->'chronic_diseases') <= 20),

  ADD CONSTRAINT details_procedure_max_items
    CHECK (details->'procedure' IS NULL OR jsonb_typeof(details->'procedure') != 'array' OR jsonb_array_length(details->'procedure') <= 20),

  ADD CONSTRAINT details_notes_max_items
    CHECK (details->'notes' IS NULL OR jsonb_typeof(details->'notes') != 'array' OR jsonb_array_length(details->'notes') <= 20);
