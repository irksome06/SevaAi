/*
# Create RTI application drafts

1. New Tables
- `rti_drafts` stores the single shared RTI application draft used by the preview screen.
- `id` is the stable draft identifier.
- Applicant fields store the name, relationship name, address, phone, and email.
- Department fields store the receiving authority and address.
- Request fields store locality, ward, financial year, and street.
- `place` and `application_date` store the signing location and date.
- `status`, `created_at`, and `updated_at` track the draft lifecycle.

2. Security
- Row level security is enabled on `rti_drafts`.
- The app does not include sign-in, so the draft is intentionally shared between anonymous and signed-in sessions for this single-tenant application.
- Four separate CRUD policies allow the preview to load and save the shared draft.

3. Important Notes
- The table uses a stable UUID so the preview updates one draft instead of creating duplicates.
- No existing tables or user data are modified.
*/

CREATE TABLE IF NOT EXISTS public.rti_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  father_spouse_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  department_address text NOT NULL DEFAULT '',
  locality text NOT NULL DEFAULT '',
  ward text NOT NULL DEFAULT '',
  financial_year text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  place text NOT NULL DEFAULT '',
  application_date text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('rti-attachments', 'rti-attachments', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "shared_rti_attachments_read" ON storage.objects;
CREATE POLICY "shared_rti_attachments_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'rti-attachments');

DROP POLICY IF EXISTS "shared_rti_attachments_upload" ON storage.objects;
CREATE POLICY "shared_rti_attachments_upload" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'rti-attachments');

ALTER TABLE public.rti_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_rti_drafts_select" ON public.rti_drafts;
CREATE POLICY "shared_rti_drafts_select" ON public.rti_drafts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_rti_drafts_insert" ON public.rti_drafts;
CREATE POLICY "shared_rti_drafts_insert" ON public.rti_drafts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shared_rti_drafts_update" ON public.rti_drafts;
CREATE POLICY "shared_rti_drafts_update" ON public.rti_drafts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shared_rti_drafts_delete" ON public.rti_drafts;
CREATE POLICY "shared_rti_drafts_delete" ON public.rti_drafts
  FOR DELETE TO anon, authenticated USING (true);
