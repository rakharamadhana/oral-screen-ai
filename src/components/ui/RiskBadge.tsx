import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { RiskLevel } from '../../lib/risk';
import { riskChipClasses } from '../../lib/risk';

const ICON = {
  TidakRujukan: CheckCircle2,
  Rujukan: AlertTriangle,
} as const;

const DOT: Record<RiskLevel, string> = {
  TidakRujukan: 'bg-tertiary',
  Rujukan: 'bg-error',
};

const LABEL: Record<RiskLevel, { id: string; en: string }> = {
  TidakRujukan: { id: 'Tidak Perlu Rujukan', en: 'No Referral' },
  Rujukan: { id: 'Perlu Rujukan', en: 'Referral' },
};

/** Small referral-status chip used in tables / history rows. */
export function RiskBadge({ level, variant = 'id' }: { level: RiskLevel; variant?: 'id' | 'en' }) {
  const text = variant === 'en' ? LABEL[level].en : LABEL[level].id;
  return (
    <span
      className={`inline-flex items-center gap-base rounded-full px-sm py-xs text-label-md font-semibold ${riskChipClasses(
        level,
      )}`}
    >
      <span className={`w-2 h-2 rounded-full ${DOT[level]}`} />
      {text}
    </span>
  );
}

export function RiskIcon({ level, size = 20 }: { level: RiskLevel; size?: number }) {
  const Icon = ICON[level];
  const color = level === 'Rujukan' ? '#ba1a1a' : '#006b2d';
  return <Icon size={size} style={{ color }} />;
}
