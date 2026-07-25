import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionTo?: string;
}

export function SectionHeader({ title, actionLabel, actionTo }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-md">
      <h4 className="text-headline-md font-semibold text-on-surface">{title}</h4>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="text-primary text-label-md font-semibold hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
