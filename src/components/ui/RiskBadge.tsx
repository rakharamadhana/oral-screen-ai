import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import type { RiskLevel } from '../../lib/risk';
import { riskChipClasses } from '../../lib/risk';

const ICON = {
  Rendah: CheckCircle2,
  Sedang: Eye,
  Tinggi: AlertTriangle,
} as const;

const DOT: Record<RiskLevel, string> = {
  Rendah: 'bg-tertiary',
  Sedang: 'bg-warning',
  Tinggi: 'bg-error',
};

const ENGLISH: Record<RiskLevel, string> = {
  Rendah: 'Low Risk',
  Sedang: 'Perlu Observasi',
  Tinggi: 'High Risk',
};

/** Small risk chip used in tables / history rows. */
export function RiskBadge({ level, variant = 'id' }: { level: RiskLevel; variant?: 'id' | 'en' }) {
  const text = variant === 'en' ? ENGLISH[level] : `Risiko ${level}`;
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
  const color = level === 'Rendah' ? '#006b2d' : level === 'Sedang' ? '#b45309' : '#ba1a1a';
  return <Icon size={size} style={{ color }} />;
}
