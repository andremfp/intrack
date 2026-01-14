-- Fix typo in users table: rename 'updsted_at' to 'updated_at'
-- Add new column 'specialty_year' to users table with default value 1

-- Rename the misspelled column
ALTER TABLE public.users RENAME COLUMN updsted_at TO updated_at;

-- Add the new specialty_year column with default value 1
ALTER TABLE public.users ADD COLUMN specialty_year integer DEFAULT 1 NOT NULL;

-- Ensure all existing users have specialty_year set to 1 (though default handles this)
-- This is a safety measure in case any records don't get the default
UPDATE public.users SET specialty_year = 1 WHERE specialty_year IS NULL;

-- Add a check constraint to ensure specialty_year is positive
ALTER TABLE public.users ADD CONSTRAINT specialty_year_positive CHECK (specialty_year > 0);
