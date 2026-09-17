-- Switches the model from binary referral (TidakRujukan/Rujukan) to a 4-class
-- oral condition classifier: MulutNormal / Sariawan / KelainanMulut / KankerMulut.
--
-- Unlike the 0006 migration, existing rows are NOT remapped: a stored binary
-- 'Rujukan' does not tell us which of the two new "needs attention" classes
-- (KelainanMulut or KankerMulut) that scan actually was, so guessing would
-- fabricate history. Old rows keep their original binary value (still valid
-- under the widened constraint below) and are simply not writable going
-- forward -- the app's RiskLevel type only allows the 4 new values, so every
-- new scan is naturally one of them.
--
-- The app also no longer re-derives risk_level from topProbability at render
-- time (that only worked because of the binary model's single scalar
-- decision threshold). risk_level is now resolved once at scan time via
-- argmax over the model's softmax output and stored as-is.

alter table public.scans drop constraint if exists scans_risk_level_check;

alter table public.scans
  add constraint scans_risk_level_check check (
    risk_level in (
      -- legacy binary values, kept valid only for pre-existing rows
      'Rujukan', 'TidakRujukan',
      -- current 4-class values
      'MulutNormal', 'Sariawan', 'KelainanMulut', 'KankerMulut'
    )
  );
