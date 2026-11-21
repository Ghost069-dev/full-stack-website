CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  demo_label TEXT,
  patient_name TEXT CHECK (patient_name IS NULL OR char_length(patient_name) <= 100),
  phone TEXT CHECK (phone IS NULL OR phone ~ '^[0-9+ -]{8,16}$'),
  age INTEGER CHECK (age IS NULL OR (age BETWEEN 1 AND 120)),
  sex TEXT CHECK (sex IS NULL OR sex IN ('M', 'F')),
  language TEXT NOT NULL CHECK (language IN ('hi', 'pa', 'mr', 'en')),
  source TEXT NOT NULL CHECK (source IN ('sample', 'upload', 'manual')),
  tests JSONB NOT NULL,
  red_flags TEXT[] NOT NULL DEFAULT '{}',
  red_count INTEGER NOT NULL DEFAULT 0,
  yellow_count INTEGER NOT NULL DEFAULT 0,
  consent BOOLEAN NOT NULL CHECK (consent = true),
  anonymized BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_consult', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(tests) = 'array'),
  CHECK (NOT anonymized OR (patient_name IS NULL AND phone IS NULL))
);

GRANT INSERT ON public.referrals TO anon, authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a consented referral"
ON public.referrals
FOR INSERT
TO anon, authenticated
WITH CHECK (consent = true AND is_demo = false AND demo_label IS NULL AND status = 'waiting');

-- Anonymised triage queue: never returns name or phone of real patients.
CREATE OR REPLACE FUNCTION public.get_triage_queue()
RETURNS TABLE (
  id UUID,
  display_label TEXT,
  is_demo BOOLEAN,
  age INTEGER,
  sex TEXT,
  language TEXT,
  source TEXT,
  tests JSONB,
  red_flags TEXT[],
  red_count INTEGER,
  yellow_count INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id,
         CASE WHEN r.is_demo THEN r.demo_label ELSE 'Patient ' || upper(left(replace(r.id::text, '-', ''), 4)) END,
         r.is_demo, r.age, r.sex, r.language, r.source, r.tests, r.red_flags,
         r.red_count, r.yellow_count, r.status, r.created_at
  FROM public.referrals r
  ORDER BY r.red_count DESC, r.yellow_count DESC, r.created_at DESC
  LIMIT 50
$$;

REVOKE ALL ON FUNCTION public.get_triage_queue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_triage_queue() TO anon, authenticated, service_role;

ALTER TABLE public.consultation_requests DROP CONSTRAINT IF EXISTS consultation_requests_language_check;
ALTER TABLE public.consultation_requests ADD CONSTRAINT consultation_requests_language_check CHECK (language IN ('hi', 'pa', 'mr', 'en'));

INSERT INTO public.referrals (is_demo, demo_label, age, sex, language, source, tests, red_flags, red_count, yellow_count, consent, anonymized, created_at) VALUES
(true, 'Ramesh Ji', 62, 'M', 'hi', 'sample',
 '[{"key":"hemoglobin","name":"Hemoglobin","value":13.5,"unit":"g/dL","zone":"green","low":13,"high":17},
   {"key":"fasting_sugar","name":"Fasting Blood Sugar","value":110,"unit":"mg/dL","zone":"yellow","low":70,"high":99},
   {"key":"hba1c","name":"HbA1c","value":9.4,"unit":"%","zone":"red","low":4,"high":5.6},
   {"key":"creatinine","name":"Serum Creatinine","value":3.4,"unit":"mg/dL","zone":"red","low":0.7,"high":1.3}]'::jsonb,
 ARRAY['Creatinine 3.4', 'HbA1c 9.4'], 2, 1, true, true, now() - interval '4 minutes'),
(true, 'Sunita Devi', 55, 'F', 'hi', 'upload',
 '[{"key":"hemoglobin","name":"Hemoglobin","value":10.9,"unit":"g/dL","zone":"yellow","low":12,"high":15.5},
   {"key":"vitamin_d","name":"Vitamin D","value":9,"unit":"ng/mL","zone":"red","low":30,"high":100},
   {"key":"fasting_sugar","name":"Fasting Blood Sugar","value":96,"unit":"mg/dL","zone":"green","low":70,"high":99}]'::jsonb,
 ARRAY['Vitamin D 9'], 1, 1, true, true, now() - interval '18 minutes'),
(true, 'Harpreet Kaur', 48, 'F', 'pa', 'manual',
 '[{"key":"tsh","name":"TSH","value":5.6,"unit":"µIU/mL","zone":"yellow","low":0.4,"high":4.5},
   {"key":"total_cholesterol","name":"Total Cholesterol","value":228,"unit":"mg/dL","zone":"yellow","low":125,"high":199}]'::jsonb,
 ARRAY[]::text[], 0, 2, true, true, now() - interval '35 minutes');