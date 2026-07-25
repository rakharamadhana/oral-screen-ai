interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/** Pill filter chip (Semua / Gejala / ... and scan region tabs). */
export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-md py-base text-body-md font-semibold transition-colors whitespace-nowrap ${
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
      }`}
    >
      {label}
    </button>
  );
}
