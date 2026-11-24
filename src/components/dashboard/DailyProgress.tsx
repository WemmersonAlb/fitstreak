import { Utensils, Droplets, CalendarCheck2 } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { slotStatuses } from '../../services/meals/meals';
import { hydrationProgress, totalForDay } from '../../services/hydration/hydration';
import { ProgressRing } from '../common/Progress';

export function DailyProgress() {
  const { data, today, index } = useAppData();
  const statuses = slotStatuses(data, today);
  const done = statuses.filter((s) => s.state !== 'pending').length;
  const water = hydrationProgress(totalForDay(data, today), data.settings.waterGoalMl);
  const activity = index.get(today);
  const tracked = !!activity?.tracked;

  const items = [
    {
      icon: Utensils,
      label: 'Alimentação',
      value: done / statuses.length,
      text: `${done}/${statuses.length}`,
      tone: 'accent' as const,
      hint: done === 0 ? 'Nenhuma ainda' : done === statuses.length ? 'Dia completo!' : `${statuses.length - done} pendente(s)`,
    },
    {
      icon: Droplets,
      label: 'Hidratação',
      value: water.ratio,
      text: `${water.percent}%`,
      tone: 'water' as const,
      hint: water.goalMet ? 'Meta atingida' : 'Em andamento',
    },
    {
      icon: CalendarCheck2,
      label: 'Registro diário',
      value: tracked ? 1 : 0,
      text: tracked ? '✓' : '—',
      tone: 'fire' as const,
      hint: tracked ? 'Dia acompanhado' : 'Sem registros',
    },
  ];

  return (
    <section className="card" aria-labelledby="progress-title">
      <h2 id="progress-title" className="eyebrow mb-4">
        Progresso de hoje
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col items-center text-center">
            <ProgressRing value={it.value} tone={it.tone} size={72} label={`${it.label}: ${it.text}`}>
              <span className="text-sm font-extrabold tabular-nums">{it.text}</span>
            </ProgressRing>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold">
              <it.icon className="h-3.5 w-3.5 text-muted" aria-hidden /> {it.label}
            </p>
            <p className="text-[11px] text-muted">{it.hint}</p>
          </div>
        ))}
      </div>
      {tracked && activity && (
        <p className="mt-4 rounded-2xl bg-surface-2 px-3 py-2 text-xs text-muted">
          <span className="font-semibold text-fg">Por que hoje conta: </span>
          {activity.reasons.join(' · ')}
        </p>
      )}
    </section>
  );
}
