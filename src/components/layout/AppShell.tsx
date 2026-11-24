import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, Utensils, Droplets, CalendarDays, Trophy, Settings, BarChart3, Flame } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { CelebrationOverlay } from '../achievements/CelebrationOverlay';
import { StorageNotice } from './StorageNotice';
import { plural } from '../../utils/format';

const MAIN_NAV = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/alimentacao', label: 'Alimentação', icon: Utensils, end: false },
  { to: '/hidratacao', label: 'Hidratação', icon: Droplets, end: false },
  { to: '/historico', label: 'Histórico', icon: CalendarDays, end: false },
];

const EXTRA_NAV = [
  { to: '/estatisticas', label: 'Estatísticas', icon: BarChart3, end: false },
  { to: '/conquistas', label: 'Conquistas', icon: Trophy, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
];

export function AppShell() {
  const { streak } = useAppData();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh md:flex">
      {/* Navegação lateral (tablet/desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line/70 bg-surface/60 px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight">FitStreak</p>
            <p className="text-xs text-muted">{plural(streak.current, 'dia', 'dias')} de ofensiva</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Navegação principal">
          {[...MAIN_NAV, ...EXTRA_NAV].map((item, i) => (
            <div key={item.to}>
              {i === MAIN_NAV.length && <div className="my-3 border-t border-line/70" />}
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg'
                  }`
                }
              >
                <item.icon className="h-5 w-5" aria-hidden />
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-safe sm:px-6 md:pb-12">
        <div className="pt-5 sm:pt-8">
          <StorageNotice />
          <Outlet />
        </div>
      </main>

      {/* Navegação inferior (celular) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/85 backdrop-blur-xl pb-safe md:hidden"
        aria-label="Navegação principal"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
          {MAIN_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-14 place-items-center rounded-full transition ${isActive ? 'bg-accent/15' : 'group-hover:bg-surface-2'}`}
                    >
                      <item.icon className="h-5 w-5" aria-hidden />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <CelebrationOverlay />
    </div>
  );
}
