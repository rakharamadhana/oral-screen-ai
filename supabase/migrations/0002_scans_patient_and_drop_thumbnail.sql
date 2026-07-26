-- Attach patient identity to scans; drop server-side thumbnail.
--
-- Image-derived data (including the downscaled thumbnail) must stay on-device
-- only, so thumbnails now live in browser localStorage — see repository.ts.

alter table public.scans add column if not exists patient_name text;
alter table public.scans add column if not exists patient_medical_id text;
alter table public.scans drop column if exists thumbnail;
