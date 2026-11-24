import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Undo2, ChevronRight } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { useWaterActions } from '../../hooks/useWaterActions';
import { entriesForDay, hydrationProgress } from '../../services/hydration/hydration';
import { formatMl } from '../../utils/format';
import { ProgressBar } from '../common/Progress';
import { WaterBottle } from './WaterBottle';
import { CustomAmountForm, QuickAddButtons } from './WaterControls';
import { WaterEntriesList } from './WaterEntriesList';

export function HydrationCard() {
  const { data, today } = useAppData();
  const { undo, remove } = useWaterActions();
  const [showCustom, setShowCustom] = useState(false);
  const [showList, setShowList] = useState(false);
  const entries = entriesForDay(data, today);
  const total = entries.reduce((s, w) => s + w.amountMl, 0);
  const p = hydrationProgress(total, data.settings.waterGoalMl);

  return (
    <section className="card" aria-labelledby="hydration-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="hydration-title" className="eyebrow">
          Hidratação
        </h2>
        <Link to="/hidratacao" className="flex items-center text-xs font-semibold text-water hover:underline">
          Detalhes <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <WaterBottle ratio={p.ratio} className="h-36 w-auto shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-extrabold tabular-nums tracking-tight">
            {formatMl(total)}
          </p>
          <p className="text-sm text-muted">de {formatMl(p.goal)}</p>
          <ProgressBar value={p.ratio} tone="water" className="mt-3" label="Progresso da hidratação" />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span className="font-semibold text-water">{p.percent}%</span>
            <span>{p.goalMet ? 'Meta atingida! 🎉' : `Faltam ${formatMl(p.remaining)}`}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <QuickAddButtons compact />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="btn-soft px-3 py-2 text-xs" onClick={() => setShowCustom((v) => !v)} aria-expanded={showCustom}>
          Quantidade personalizada
        </button>
        <button className="btn-soft px-3 py-2 text-xs" onClick={undo} disabled={!entries.length}>
          <Undo2 className="h-3.5 w-3.5" /> Desfazer último
        </button>
        <button
          className="btn-ghost ml-auto px-3 py-2 text-xs"
          onClick={() => setShowList((v) => !v)}
          aria-expanded={showList}
        >
          {entries.length} registro(s)
          <ChevronDown className={`h-4 w-4 transition ${showList ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {showCustom && (
        <div className="mt-3 animate-fade-up">
          <CustomAmountForm onDone={() => setShowCustom(false)} />
        </div>
      )}
      {showList && (
        <div className="mt-2 animate-fade-up">
          <WaterEntriesList entries={entries} onRemove={remove} />
        </div>
      )}
    </section>
  );
}
