CREATE TABLE public.consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL CHECK (char_length(patient_name) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (phone ~ '^[0-9+ -]{8,16}$'),
  age INTEGER CHECK (age IS NULL OR (age BETWEEN 1 AND 120)),
  consult_mode TEXT NOT NULL CHECK (consult_mode IN ('video', 'phone', 'clinic')),
  preferred_date DATE,
  preferred_slot TEXT NOT NULL CHECK (preferred_slot IN ('morning', 'afternoon', 'evening')),
  language TEXT NOT NULL DEFAULT 'hi' CHECK (language IN ('hi', 'en')),
  concerns TEXT CHECK (concerns IS NULL OR char_length(concerns) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.consultation_requests TO anon, authenticated;
GRANT ALL ON public.consultation_requests TO service_role;

ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a consultation request"
ON public.consultation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);