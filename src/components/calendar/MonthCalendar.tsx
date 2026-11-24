import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { WEEKDAYS_SHORT, daysInMonth, monthName } from '../../utils/date';
import type { DayActivity } from '../../services/streak/streak';

export type DayKind = 'free' | 'complete' | 'partial' | 'none' | 'future';

export function dayKind(a: DayActivity | undefined, key: string, today: string): DayKind {
  if (key > today) return 'future';
  if (!a || !a.tracked) return 'none';
  if (a.freeMealCount) return 'free';
  return a.waterEntryCount && a.goalMet ? 'complete' : 'partial';
}

const KIND_CLASS: Record<DayKind, string> = {
  complete: 'bg-accent text-white dark:text-[#06210f]',
  partial: 'bg-warn/80 text-[#2a1f00]',
  free: 'bg-water text-white dark:text-[#071a33]',
  none: 'bg-surface-2 text-muted',
  future: 'text-muted/40',
};

export const LEGEND: { kind: DayKind; label: string }[] = [
  { kind: 'complete', label: 'Acompanhado + meta de água' },
  { kind: 'partial', label: 'Acompanhado, meta de água não atingida' },
  { kind: 'free', label: 'Com refeição livre' },
  { kind: 'none', label: 'Sem registros' },
];

export function MonthCalendar({ onSelect }: { onSelect: (key: string) => void }) {
  const { today, index } = useAppData();
  const [ty, tm] = today.split('-').map(Number);
  const [cursor, setCursor] = useState({ y: ty, m: tm });
  const total = daysInMonth(cursor.y, cursor.m);
  const firstWeekday = new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).getUTCDay();
  const prefix = `${cursor.y}-${String(cursor.m).padStart(2, '0')}`;
  const keys = Array.from({ length: total }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);
  const trackedCount = keys.filter((k) => index.get(k)?.tracked).length;
  const isCurrent = cursor.y === ty && cursor.m === tm;

  const move = (delta: number) =>
    setCursor(({ y, m }) => {
      const t = y * 12 + (m - 1) + delta;
      return { y: Math.floor(t / 12), m: (t % 12) + 1 };
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button className="btn-ghost p-2" onClick={() => move(-1)} aria-label="Mês anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-bold capitalize">
            {monthName(cursor.m)} {cursor.y}
          </p>
          <p className="text-xs text-muted">{trackedCount} dia(s) acompanhado(s)</p>
        </div>
        <button className="btn-ghost p-2" onClick={() => move(1)} disabled={isCurrent} aria-label="Próximo mês">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label={`Calendário de ${monthName(cursor.m)} de ${cursor.y}`}>
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={i} className="pb-1 text-[11px] font-semibold text-muted" aria-hidden>
            {d}
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`e${i}`} />
        ))}
        {keys.map((k, i) => {
          const kind = dayKind(index.get(k), k, today);
          const isToday = k === today;
          return (
            <button
              key={k}
              onClick={() => onSelect(k)}
              disabled={kind === 'future'}
              className={`relative aspect-square rounded-xl text-sm font-semibold tabular-nums transition hover:scale-105 disabled:hover:scale-100 ${KIND_CLASS[kind]} ${
                isToday ? 'ring-2 ring-fg/70 ring-offset-2 ring-offset-surface' : ''
              }`}
              aria-label={`${i + 1} de ${monthName(cursor.m)}: ${LEGEND.find((l) => l.kind === kind)?.label ?? 'futuro'}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-1.5 text-xs text-muted sm:grid-cols-2">
        {LEGEND.map((l) => (
          <li key={l.kind} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded ${KIND_CLASS[l.kind]}`} aria-hidden />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
