import { useId } from 'react';

/** Garrafa que se preenche conforme o consumo. */
export function WaterBottle({ ratio, className = '' }: { ratio: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const level = Math.max(0, Math.min(1, ratio));
  // Área útil da garrafa: y de 34 a 196 (162px).
  const top = 196 - 162 * level;
  return (
    <svg viewBox="0 0 100 200" className={className} role="img" aria-label={`Garrafa ${Math.round(level * 100)}% cheia`}>
      <defs>
        <clipPath id={`bottle-${id}`}>
          <path d="M38 6h24v14c0 4 3 7 7 10 8 6 13 14 13 25v128c0 9-7 15-16 15H34c-9 0-16-6-16-15V55c0-11 5-19 13-25 4-3 7-6 7-10V6z" />
        </clipPath>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-water))" stopOpacity="0.85" />
          <stop offset="100%" stopColor="rgb(var(--c-water))" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#bottle-${id})`}>
        <rect x="0" y="0" width="100" height="200" className="fill-surface-2" />
        <g style={{ transform: `translateY(${top}px)`, transition: 'transform 0.9s cubic-bezier(.2,.8,.2,1)' }}>
          <g className="animate-wave">
            <path
              d="M0 6 Q 12.5 0 25 6 T 50 6 T 75 6 T 100 6 T 125 6 T 150 6 T 175 6 T 200 6 V 220 H 0 Z"
              fill={`url(#water-${id})`}
            />
          </g>
          <circle cx="30" cy="40" r="3" fill="white" opacity="0.35" />
          <circle cx="62" cy="70" r="2" fill="white" opacity="0.3" />
          <circle cx="45" cy="100" r="2.5" fill="white" opacity="0.25" />
        </g>
      </g>
      <path
        d="M38 6h24v14c0 4 3 7 7 10 8 6 13 14 13 25v128c0 9-7 15-16 15H34c-9 0-16-6-16-15V55c0-11 5-19 13-25 4-3 7-6 7-10V6z"
        className="fill-none stroke-line"
        strokeWidth="3"
      />
      <rect x="36" y="2" width="28" height="8" rx="3" className="fill-line" />
      {[0.25, 0.5, 0.75].map((m) => (
        <line key={m} x1="70" x2="78" y1={196 - 162 * m} y2={196 - 162 * m} className="stroke-muted/50" strokeWidth="2" />
      ))}
    </svg>
  );
}
