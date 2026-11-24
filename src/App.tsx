import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppDataProvider } from './state/AppDataContext';
import { ToastProvider } from './state/ToastContext';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/Dashboard/DashboardPage';
import NutritionPage from './pages/Nutrition/NutritionPage';
import HydrationPage from './pages/Hydration/HydrationPage';
import HistoryPage from './pages/History/HistoryPage';
import AchievementsPage from './pages/Achievements/AchievementsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Recharts é carregado sob demanda.
const StatsPage = lazy(() => import('./pages/History/StatsPage'));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="alimentacao" element={<NutritionPage />} />
        <Route path="hidratacao" element={<HydrationPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route
          path="estatisticas"
          element={
            <Suspense fallback={<p className="py-10 text-center text-sm text-muted">Carregando estatísticas…</p>}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route path="conquistas" element={<AchievementsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  // HashRouter: rotas funcionam em hospedagem estática (GitHub Pages) sem 404 ao recarregar.
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AppDataProvider>
          <AppRoutes />
        </AppDataProvider>
      </ToastProvider>
    </HashRouter>
  );
}
