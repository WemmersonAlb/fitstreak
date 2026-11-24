import type { ReactNode } from 'react';

export function ProgressBar({
  value,
  tone = 'accent',
  label,
  className = '',
}: {
  value: number;
  tone?: 'accent' | 'water' | 'fire';
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value * 100));
  const color = tone === 'water' ? 'bg-water' : tone === 'fire' ? 'bg-fire' : 'bg-accent';
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <div className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  tone = 'accent',
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'accent' | 'water' | 'fire';
  children?: ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const color = tone === 'water' ? 'text-water' : tone === 'fire' ? 'text-fire' : 'text-accent';
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-surface-2" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`fill-none stroke-current ${color} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
