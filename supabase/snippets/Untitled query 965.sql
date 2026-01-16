-- Add triggers to automatically update updated_at field on consultations, users, and specialties tables
-- Uses the existing update_updated_at_column() function from rate_limiting migration

-- The function already exists from 20260105000000_rate_limiting.sql
-- We just need to create the triggers for consultations, users, and specialties tables

-- Trigger for consultations table
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for specialties table
CREATE TRIGGER update_specialties_updated_at
    BEFORE UPDATE ON public.specialties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
