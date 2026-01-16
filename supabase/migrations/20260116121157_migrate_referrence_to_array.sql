-- Migrate referrence field from string to array format
-- This migration converts existing string values like "cir toracica" to ["cir toracica"]
-- while preserving null values and leaving existing arrays unchanged

-- Update consultations where referrence is a string (not null, not array)
UPDATE public.consultations
SET details = jsonb_set(
  details,
  '{referrence}',
  jsonb_build_array(details->>'referrence')
)
WHERE details->'referrence' IS NOT NULL
  AND jsonb_typeof(details->'referrence') = 'string'
  AND details->>'referrence' != '';
