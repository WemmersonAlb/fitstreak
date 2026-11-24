import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORY_LABEL, type AchievementCategory, type AchievementDef } from '../../data/achievements/definitions';
import { buildAchievementContext } from '../../services/achievements/context';
import { achievementProgress, metricValue } from '../../services/achievements/engine';
import { PageHeader, Segmented } from '../../components/common/ui';
import { ProgressBar } from '../../components/common/Progress';
import { formatFullShort, toDateKey } from '../../utils/date';
import { formatNumber } from '../../utils/format';

type Filter = 'todas' | AchievementCategory;

function AchievementTile({ def, unlockedAt, progress, value }: { def: AchievementDef; unlockedAt?: string; progress: number; value: number }) {
  const unlocked = !!unlockedAt;
  const hidden = def.secret && !unlocked;
  return (
    <li
      className={`relative flex gap-4 overflow-hidden rounded-3xl border p-4 transition ${
        unlocked ? 'border-accent/30 bg-surface' : 'border-line/60 bg-surface/60'
      }`}
    >
      {def.celebration === 'six-seven' && unlocked && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fire/20 blur-2xl" aria-hidden />
      )}
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ${
          unlocked ? 'bg-accent/10' : 'bg-surface-2 grayscale'
        }`}
        aria-hidden
      >
        {hidden ? <Lock className="h-6 w-6 text-muted" /> : <span className={unlocked ? '' : 'opacity-40'}>{def.emoji}</span>}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className={`font-bold ${unlocked ? '' : 'text-muted'}`}>{hidden ? 'Conquista secreta' : def.title}</p>
        <p className="mt-0.5 text-sm text-muted">{hidden ? 'Continue usando o app para descobrir. 👀' : def.description}</p>
        {!hidden && (
          <p className="mt-1.5 text-xs text-muted">
            <span className="font-semibold">Como desbloquear:</span> {def.condition}
          </p>
        )}
        {unlocked ? (
          <p className="mt-2 text-xs font-semibold text-accent">Desbloqueada em {formatFullShort(toDateKey(new Date(unlockedAt)))}</p>
        ) : (
          !hidden &&
          def.target > 1 && (
            <div className="mt-2">
              <ProgressBar value={progress} label={`Progresso: ${def.title}`} />
              <p className="mt-1 text-[11px] tabular-nums text-muted">
                {formatNumber(Math.min(value, def.target))} / {formatNumber(def.target)}
              </p>
            </div>
          )
        )}
      </div>
    </li>
  );
}

export default function AchievementsPage() {
  const { data, today } = useAppData();
  const [filter, setFilter] = useState<Filter>('todas');
  const ctx = useMemo(() => buildAchievementContext(data, today), [data, today]);
  const unlockedCount = Object.keys(data.achievements).filter((id) => ACHIEVEMENTS.some((a) => a.id === id)).length;

  const list = ACHIEVEMENTS.filter((a) => filter === 'todas' || a.category === filter).sort((a, b) => {
    const ua = data.achievements[a.id] ? 0 : 1;
    const ub = data.achievements[b.id] ? 0 : 1;
    return ua - ub;
  });

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader title="Conquistas" subtitle={`${unlockedCount} de ${ACHIEVEMENTS.length} desbloqueadas`} />
      <ProgressBar value={unlockedCount / ACHIEVEMENTS.length} label="Conquistas desbloqueadas" />
      <div className="sticky top-0 z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <Segmented
          label="Categoria"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todas', label: 'Todas' },
            ...(Object.keys(ACHIEVEMENT_CATEGORY_LABEL) as AchievementCategory[]).map((c) => ({
              value: c,
              label: ACHIEVEMENT_CATEGORY_LABEL[c],
            })),
          ]}
        />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((def) => (
          <AchievementTile
            key={def.id}
            def={def}
            unlockedAt={data.achievements[def.id]?.unlockedAt}
            progress={achievementProgress(ctx, def)}
            value={metricValue(ctx, def.metric)}
          />
        ))}
      </ul>
    </div>
  );
}
