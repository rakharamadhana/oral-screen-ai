import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-base font-semibold text-body-md rounded-full px-md py-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container',
  outline: 'border border-outline text-on-surface hover:bg-surface-container',
  ghost: 'text-primary hover:bg-surface-container-low',
};

/** Pill-shaped button per the design system. */
export function Button({
  variant = 'primary',
  children,
  fullWidth,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
