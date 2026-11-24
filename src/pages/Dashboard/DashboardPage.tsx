import { Link } from 'react-router-dom';
import { Trophy, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { formatLongDate, greeting, hourInAppZone } from '../../utils/date';
import { slotStatuses } from '../../services/meals/meals';
import { StreakCard } from '../../components/dashboard/StreakCard';
import { DailyProgress } from '../../components/dashboard/DailyProgress';
import { HydrationCard } from '../../components/hydration/HydrationCard';
import { MealSlotList } from '../../components/meals/MealSlotList';
import { ACHIEVEMENTS } from '../../data/achievements/definitions';

export default function DashboardPage() {
  const { data, today } = useAppData();
  const name = data.settings.userName.trim();
  const statuses = slotStatuses(data, today);
  const done = statuses.filter((s) => s.state !== 'pending').length;
  const unlocked = Object.keys(data.achievements).length;

  return (
    <div className="space-y-4 animate-fade-up">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted first-letter:uppercase">{formatLongDate(today)}</p>
          <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {greeting(hourInAppZone())}
            {name ? `, ${name}` : ''}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            {done === 0
              ? 'Nenhuma refeição registrada ainda hoje.'
              : `${done} de ${statuses.length} refeições acompanhadas · ${statuses.length - done} pendente(s).`}
          </p>
        </div>
        <div className="flex gap-1 md:hidden">
          <Link to="/conquistas" className="btn-ghost p-2.5" aria-label="Conquistas">
            <Trophy className="h-5 w-5" />
          </Link>
          <Link to="/estatisticas" className="btn-ghost p-2.5" aria-label="Estatísticas">
            <BarChart3 className="h-5 w-5" />
          </Link>
          <Link to="/ajustes" className="btn-ghost p-2.5" aria-label="Ajustes">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <StreakCard />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyProgress />
        <HydrationCard />
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="eyebrow">Refeições de hoje</h2>
          <Link to="/alimentacao" className="flex items-center text-xs font-semibold text-accent hover:underline">
            Plano completo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <MealSlotList />
      </section>

      <Link
        to="/conquistas"
        className="card flex items-center gap-4 transition hover:border-accent/40"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-warn/15 text-2xl" aria-hidden>
          🏆
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Conquistas</span>
          <span className="text-sm text-muted">
            {unlocked} de {ACHIEVEMENTS.length} desbloqueadas
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    </div>
  );
}
