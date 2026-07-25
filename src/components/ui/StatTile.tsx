import type { LucideIcon } from 'lucide-react';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}

/** Icon + label + value row used in the health-stats card. */
export function StatTile({
  icon: Icon,
  label,
  value,
  iconBg = 'bg-primary-container',
  iconColor = 'text-on-primary-container',
}: StatTileProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-sm">
        <div className={`p-base rounded-lg ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
        <span className="text-body-md text-on-surface-variant">{label}</span>
      </div>
      <span className="text-headline-md font-semibold text-on-surface">{value}</span>
    </div>
  );
}
