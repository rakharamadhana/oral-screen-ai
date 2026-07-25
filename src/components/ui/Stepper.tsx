import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
}

/** Horizontal medical progress tracker (desktop). */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-base">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-body-md font-semibold ${
                  done || active
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface-variant'
                }`}
              >
                {done ? <Check size={18} /> : i + 1}
              </div>
              <span
                className={`text-label-md font-semibold ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] flex-1 mx-sm ${done ? 'bg-primary' : 'bg-outline-variant'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact progress bar with "LANGKAH x DARI n" (mobile). */
export function StepperMobile({ steps, current }: StepperProps) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant p-md">
      <div className="flex items-center justify-between mb-sm">
        <span className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
          Langkah {current + 1} dari {steps.length}
        </span>
        <span className="text-label-md font-semibold text-primary">{steps[current]}</span>
      </div>
      <div className="flex gap-base">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-primary' : 'bg-outline-variant'}`}
          />
        ))}
      </div>
    </div>
  );
}
