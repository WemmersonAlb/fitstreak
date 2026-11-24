import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight, Flame } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { PageHeader, EmptyState } from '../../components/common/ui';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { DayDetailModal } from '../../components/calendar/DayDetailModal';
import { formatFullShort } from '../../utils/date';
import { plural } from '../../utils/format';

export default function HistoryPage() {
  const { streak } = useAppData();
  const [selected, setSelected] = useState<string | null>(null);
  const runs = [...streak.runs].reverse().slice(0, 8);

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        title="Histórico"
        subtitle="Toque em um dia para ver os detalhes."
        action={
          <Link to="/estatisticas" className="btn-soft px-3 py-2 text-xs">
            <BarChart3 className="h-4 w-4" /> Estatísticas
          </Link>
        }
      />

      <section className="card">
        <MonthCalendar onSelect={setSelected} />
      </section>

      <section className="card">
        <h2 className="eyebrow mb-3">Ofensivas</h2>
        {runs.length === 0 ? (
          <EmptyState emoji="🔥" title="Nenhuma ofensiva ainda" description="Registre uma refeição ou um copo de água para começar." />
        ) : (
          <ul className="space-y-2">
            {runs.map((r) => {
              const best = r.length === streak.best;
              const active = streak.current > 0 && r === streak.runs[streak.runs.length - 1];
              return (
                <li key={r.start} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-fire/15 text-fire' : 'bg-surface text-muted'}`}>
                    <Flame className="h-5 w-5" />
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{plural(r.length, 'dia', 'dias')}</p>
                    <p className="text-xs text-muted">
                      {formatFullShort(r.start)} → {formatFullShort(r.end)}
                    </p>
                  </div>
                  {active && <span className="chip border-fire/30 bg-fire/10 text-fire">Atual</span>}
                  {best && <span className="chip border-warn/30 bg-warn/10 text-warn">Recorde</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link to="/conquistas" className="card flex items-center gap-4 transition hover:border-accent/40">
        <span className="text-2xl" aria-hidden>
          🏆
        </span>
        <span className="flex-1 font-semibold">Ver conquistas</span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>

      <DayDetailModal dateKey={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
