-- Fix 22: Enforce a per-(user_id, specialty_id) consultation count cap.
-- Prevents unbounded row accumulation that would inflate query and export costs.

CREATE OR REPLACE FUNCTION check_consultation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM consultations
    WHERE user_id = NEW.user_id
      AND specialty_id = NEW.specialty_id
  ) >= 5000 THEN
    RAISE EXCEPTION 'consultation_limit_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_consultation_limit
BEFORE INSERT ON consultations
FOR EACH ROW EXECUTE FUNCTION check_consultation_count();
