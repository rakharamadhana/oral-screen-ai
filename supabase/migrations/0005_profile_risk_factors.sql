-- Risk-factor questionnaire moved from the per-scan flow into the profile, so
-- it's asked/edited once (on the Profil page) rather than every scan.

alter table public.profiles
  add column if not exists risk_factors jsonb not null default '[]'::jsonb;
