import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Optional color-coded left status border (Clinical Clarity status card). */
  accent?: string;
  style?: CSSProperties;
}

/** White surface card: 1px outline, 12px radius, flat (per Clinical Clarity). */
export function Card({ children, className = '', accent, style }: CardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant ${className}`}
      style={{ ...(accent ? { borderLeft: `6px solid ${accent}` } : {}), ...style }}
    >
      {children}
    </div>
  );
}
