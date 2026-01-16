-- TEST SCRIPT: Preview referrence migration changes
-- Run this BEFORE running the actual migration to see what will be changed
-- This script does NOT modify any data, it only shows what would change

-- ============================================================================
-- QUERY 1: Complete Overview - All referrence types and counts
-- ============================================================================
SELECT 
  'Summary' AS report_section,
  COUNT(*) FILTER (
    WHERE details->'referrence' IS NULL  
       OR jsonb_typeof(details->'referrence') = 'null'
  ) AS null_referrence_count,
  COUNT(*) FILTER (WHERE jsonb_typeof(details->'referrence') = 'array') AS array_referrence_count,
  COUNT(*) FILTER (WHERE jsonb_typeof(details->'referrence') = 'string') AS string_referrence_count,
  COUNT(*) AS total_consultations
FROM public.consultations;

-- ============================================================================
-- QUERY 2: Sample consultations that will be affected (have string referrence)
-- ============================================================================
SELECT 
  'Sample to Migrate' AS report_section,
  id,
  date,
  details->>'referrence' AS current_referrence_string,
  jsonb_typeof(details->'referrence') AS current_type,
  jsonb_build_array(details->>'referrence') AS would_become_array
FROM public.consultations
WHERE details->'referrence' IS NOT NULL
  AND jsonb_typeof(details->'referrence') = 'string'
  AND details->>'referrence' != ''
LIMIT 10;

-- ============================================================================
-- QUERY 3: Count and unique referral types that will be migrated
-- ============================================================================
SELECT 
  'Migration Stats' AS report_section,
  COUNT(*) AS consultations_to_update,
  COUNT(DISTINCT details->>'referrence') AS unique_referral_types
FROM public.consultations
WHERE details->'referrence' IS NOT NULL
  AND jsonb_typeof(details->'referrence') = 'string'
  AND details->>'referrence' != '';

-- ============================================================================
-- QUERY 4: Diagnostic - Detailed breakdown of referrence types
-- ============================================================================
SELECT 
  'Diagnostic' AS report_section,
  COALESCE(jsonb_typeof(details->'referrence'), 'missing_key') AS referrence_type,
  COUNT(*) AS count,
  CASE 
    WHEN details->'referrence' IS NULL THEN 'Missing key'
    WHEN jsonb_typeof(details->'referrence') = 'null' THEN 'JSON null'
    WHEN details->>'referrence' = 'null' THEN 'String "null"'
    ELSE 'Has value'
  END AS null_status
FROM public.consultations
GROUP BY 
  jsonb_typeof(details->'referrence'),
  CASE 
    WHEN details->'referrence' IS NULL THEN 'Missing key'
    WHEN jsonb_typeof(details->'referrence') = 'null' THEN 'JSON null'
    WHEN details->>'referrence' = 'null' THEN 'String "null"'
    ELSE 'Has value'
  END
ORDER BY count DESC;
