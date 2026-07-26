// Prominent risk-score display: a large percentage + a meter bar with the
// referral-threshold marker, so the number is obvious and interpretable.

import { useLang } from '../../lib/i18n';

export function ScoreMeter({
  probability,
  color,
  threshold,
}: {
  /** 0..1 probability of needing referral. */
  probability: number;
  /** Risk color (hex) for the number + bar fill. */
  color: string;
  /** Optional 0..1 decision threshold; draws a marker + caption when provided. */
  threshold?: number;
}) {
  const { t } = useLang();
  const pct = Math.max(0, Math.min(100, probability * 100));
  const markerPct = threshold !== undefined ? Math.max(0, Math.min(100, threshold * 100)) : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-md mb-sm">
        <div>
          <p className="text-label-md uppercase font-bold text-on-surface-variant">
            {t('Skor Risiko', 'Risk Score')}
          </p>
          <p className="text-caption text-on-surface-variant">
            {t('Kemungkinan perlu rujukan', 'Likelihood of needing referral')}
          </p>
        </div>
        <span className="text-display-lg-mobile font-extrabold leading-none" style={{ color }}>
          {pct.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-surface-container overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        {markerPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{ left: `${markerPct}%`, backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
        )}
      </div>

      {markerPct !== null && (
        <p className="text-caption text-on-surface-variant mt-xs">
          {t(
            `Ambang rujukan ~${markerPct.toFixed(0)}%. Skor di atas garis ini menandakan perlunya pemeriksaan lanjutan.`,
            `Referral threshold ~${markerPct.toFixed(0)}%. A score above this line indicates further examination is advised.`,
          )}
        </p>
      )}
    </div>
  );
}
