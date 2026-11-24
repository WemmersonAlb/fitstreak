import { Flame, Trophy, CalendarCheck2 } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { nextMilestone } from '../../services/streak/streak';
import { ACHIEVEMENTS } from '../../data/achievements/definitions';
import { ProgressBar } from '../common/Progress';
import { plural } from '../../utils/format';

export function StreakCard() {
  const { streak } = useAppData();
  const next = nextMilestone(streak.current);
  const nextDef = next ? ACHIEVEMENTS.find((a) => a.metric === 'bestStreak' && a.target === next && !a.secret) : undefined;
  const prev = [...ACHIEVEMENTS].filter((a) => a.metric === 'bestStreak' && a.target <= streak.current).pop()?.target ?? 0;
  const progress = next ? (streak.current - prev) / (next - prev) : 1;
  const isRecord = streak.current > 0 && streak.current >= streak.best;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-fire/20 bg-gradient-to-br from-fire/15 via-surface to-surface p-5"
      aria-labelledby="streak-title"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fire/20 blur-3xl" aria-hidden />
      <div className="relative flex items-center gap-4">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${
            streak.current > 0 ? 'bg-fire/15 text-fire' : 'bg-surface-2 text-muted'
          }`}
        >
          <Flame className={`h-9 w-9 ${streak.current > 0 ? 'animate-flicker' : ''}`} fill="currentColor" fillOpacity={0.25} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="streak-title" className="eyebrow">
            Ofensiva atual
          </h2>
          <p key={streak.current} className="animate-pop text-4xl font-black tabular-nums tracking-tight">
            {streak.current}
            <span className="ml-1.5 text-lg font-bold text-muted">{streak.current === 1 ? 'dia' : 'dias'}</span>
          </p>
        </div>
        {isRecord && streak.current > 1 && (
          <span className="chip border-fire/30 bg-fire/10 text-fire">
            <Trophy className="h-3.5 w-3.5" /> Recorde!
          </span>
        )}
      </div>

      <p className="relative mt-3 text-sm text-muted">
        {streak.todayTracked
          ? 'Hoje já está contando. Bom trabalho! ✅'
          : streak.atRisk
            ? 'Registre uma refeição ou um copo de água hoje para manter a ofensiva.'
            : 'Registre uma refeição ou água para começar uma nova ofensiva.'}
      </p>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-surface-2/80 p-3">
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Trophy className="h-3.5 w-3.5" /> Recorde
          </p>
          <p className="mt-0.5 font-bold tabular-nums">{plural(streak.best, 'dia', 'dias')}</p>
        </div>
        <div className="rounded-2xl bg-surface-2/80 p-3">
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarCheck2 className="h-3.5 w-3.5" /> Dias acompanhados
          </p>
          <p className="mt-0.5 font-bold tabular-nums">{plural(streak.totalTrackedDays, 'dia', 'dias')}</p>
        </div>
      </div>

      {next && (
        <div className="relative mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted">
              Próxima conquista: <span className="font-semibold text-fg">{nextDef?.title ?? `${next} dias`}</span>
            </span>
            <span className="font-semibold tabular-nums text-fire">
              {streak.current}/{next}
            </span>
          </div>
          <ProgressBar value={progress} tone="fire" label="Progresso para a próxima conquista" />
        </div>
      )}
    </section>
  );
}
