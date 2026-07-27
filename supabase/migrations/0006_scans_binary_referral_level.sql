-- Switch scan risk_level from the 3-level scheme (Rendah/Sedang/Tinggi) to a
-- binary referral verdict (TidakRujukan/Rujukan) shown in the UI.
--
-- The app now derives the verdict from topProbability at render time, so the
-- stored value is remapped only to keep existing rows consistent with the new
-- CHECK constraint.

alter table public.scans drop constraint if exists scans_risk_level_check;

update public.scans
set risk_level = case
  when risk_level in ('Sedang', 'Tinggi', 'Rujukan') then 'Rujukan'
  else 'TidakRujukan'
end;

alter table public.scans
  add constraint scans_risk_level_check check (risk_level in ('Rujukan', 'TidakRujukan'));
