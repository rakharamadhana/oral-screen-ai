import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import type { RiskLevel } from '../../lib/risk';
import { riskChipClasses } from '../../lib/risk';

const ICON = {
  MulutNormal: CheckCircle2,
  Sariawan: AlertCircle,
  KelainanMulut: AlertTriangle,
  KankerMulut: ShieldAlert,
} as const;

const COLOR: Record<RiskLevel, string> = {
  MulutNormal: '#006b2d',
  Sariawan: '#f9a825',
  KelainanMulut: '#ef6c00',
  KankerMulut: '#ba1a1a',
};

const DOT: Record<RiskLevel, string> = {
  MulutNormal: 'bg-tertiary',
  Sariawan: 'bg-tertiary-container',
  KelainanMulut: 'bg-secondary',
  KankerMulut: 'bg-error',
};

const LABEL: Record<RiskLevel, { id: string; en: string }> = {
  MulutNormal: { id: 'Mulut Normal', en: 'Normal' },
  Sariawan: { id: 'Diduga Sariawan', en: 'Suspected Canker Sore' },
  KelainanMulut: { id: 'Diduga Kelainan Mulut', en: 'Suspected Abnormality' },
  KankerMulut: { id: 'Diduga Kanker Mulut', en: 'Suspected Cancer' },
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
  return <Icon size={size} style={{ color: COLOR[level] }} />;
}
