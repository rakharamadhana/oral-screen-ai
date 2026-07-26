-- Seed the single demo profile row with a fixed uuid so client upserts
-- (saveProfile) target a stable id.
--
-- Previously SEED_PROFILE.id was the string 'demo-user', which is not a valid
-- uuid for the profiles PK — so every saveProfile() upsert silently errored and
-- profile/notification changes never persisted. SEED_PROFILE.id now matches
-- this uuid (see src/lib/mockData.ts).

insert into public.profiles (id, full_name, email, medical_id, phone, birth_date, member_since, verified, notifications)
values (
  '00000000-0000-0000-0000-000000000001',
  'Andi Setiawan',
  'andi.setiawan@email.com',
  'OD-92831',
  '+62 812 3456 7890',
  '15 Maret 1990',
  'Jan 2024',
  true,
  '{"exams":true,"education":true,"updates":false}'::jsonb
)
on conflict (id) do nothing;
