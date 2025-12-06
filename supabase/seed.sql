-- Seed data for specialties table
INSERT INTO public.specialties (code, name, years) VALUES 
  ('mgf', 'Medicina Geral e Familiar', 4)
ON CONFLICT (code) DO NOTHING;