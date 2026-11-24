import { Link } from 'react-router-dom';
import { Undo2, Settings2 } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { useWaterActions } from '../../hooks/useWaterActions';
import { entriesForDay, hydrationProgress } from '../../services/hydration/hydration';
import { hasDataInRange, waterSeries } from '../../services/stats/stats';
import { formatMl } from '../../utils/format';
import { PageHeader, EmptyState } from '../../components/common/ui';
import { ProgressBar } from '../../components/common/Progress';
import { WaterBottle } from '../../components/hydration/WaterBottle';
import { CustomAmountForm, QuickAddButtons } from '../../components/hydration/WaterControls';
import { WaterEntriesList } from '../../components/hydration/WaterEntriesList';
import { WaterBarChart } from '../../components/charts/Charts';

export default function HydrationPage() {
  const { data, today, index } = useAppData();
  const { undo, remove } = useWaterActions();
  const entries = entriesForDay(data, today);
  const total = entries.reduce((s, w) => s + w.amountMl, 0);
  const p = hydrationProgress(total, data.settings.waterGoalMl);
  const week = waterSeries(data, today, 7, index);

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        title="Hidratação"
        subtitle="Meta orientada pela nutricionista. Cada dia começa do zero."
        action={
          <Link to="/ajustes" className="btn-ghost p-2.5" aria-label="Ajustar meta">
            <Settings2 className="h-5 w-5" />
          </Link>
        }
      />

      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -left-10 top-10 h-48 w-48 rounded-full bg-water/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          <WaterBottle ratio={p.ratio} className="h-64 w-auto" />
          <div className="w-full flex-1 text-center sm:text-left">
            <p className="eyebrow">Hoje</p>
            <p className="mt-1 text-5xl font-black tabular-nums tracking-tight text-water">{formatMl(total)}</p>
            <p className="mt-1 text-muted">de {formatMl(p.goal)}</p>
            <ProgressBar value={p.ratio} tone="water" className="mt-4 h-3" label="Progresso da hidratação" />
            <div className="mt-2 flex justify-between text-sm">
              <span className="font-bold text-water">{p.percent}%</span>
              <span className="text-muted">{p.goalMet ? 'Meta atingida! 🎉' : `Faltam ${formatMl(p.remaining)}`}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="eyebrow">Registrar</h2>
        <QuickAddButtons />
        <CustomAmountForm />
        <button className="btn-soft w-full" onClick={undo} disabled={!entries.length}>
          <Undo2 className="h-4 w-4" /> Desfazer último registro
        </button>
      </section>

      <section className="card">
        <h2 className="eyebrow mb-2">Registros de hoje</h2>
        <WaterEntriesList entries={entries} onRemove={remove} />
      </section>

      <section className="card">
        <h2 className="eyebrow mb-3">Últimos 7 dias</h2>
        {hasDataInRange(index, today, 7) && week.some((d) => d.ml > 0) ? (
          <WaterBarChart data={week} />
        ) : (
          <EmptyState emoji="📊" title="Ainda sem histórico" description="Registre água por alguns dias para ver sua evolução aqui." />
        )}
      </section>
    </div>
  );
}
