import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData, MealSlotId, Settings, WaterEntry } from '../types';
import type { AchievementDef } from '../data/achievements/definitions';
import { StorageRepository, type AutoBackupInfo, type LoadResult } from '../services/storage/repository';
import { evaluateAchievements } from '../services/achievements/engine';
import { buildActivityIndex, computeStreak, trackedDayKeys, type DayActivity, type StreakInfo } from '../services/streak/streak';
import * as hydration from '../services/hydration/hydration';
import * as meals from '../services/meals/meals';
import { backupFileName, createBackup, mergeData, parseBackup, serializeBackup } from '../services/backup/backup';
import { useToday } from '../hooks/useToday';
import { useApplyTheme } from '../hooks/useApplyTheme';

export type ImportMode = 'replace' | 'merge';

export interface AppDataContextValue {
  data: AppData;
  today: string;
  index: Map<string, DayActivity>;
  streak: StreakInfo;
  loadResult: LoadResult;
  persistent: boolean;
  celebrations: AchievementDef[];
  dismissCelebration: () => void;
  addWater: (amountMl: number) => WaterEntry;
  removeWater: (id: string) => void;
  undoWater: () => WaterEntry | null;
  addMeal: (input: meals.MealLogInput) => void;
  removeMeal: (id: string) => void;
  addFreeMeal: (input: meals.FreeMealInput) => void;
  removeFreeMeal: (id: string) => void;
  updateSettings: (patch: Partial<Omit<Settings, 'waterGoalMl'>>) => void;
  setMealTime: (slot: MealSlotId, time: string) => void;
  setWaterGoal: (goal: number) => void;
  setDailyNote: (dateKey: string, note: string) => void;
  exportBackup: () => { fileName: string; content: string };
  importBackup: (text: string, mode: ImportMode) => { ok: true; backup: AutoBackupInfo | null } | { ok: false; error: string };
  listAutoBackups: () => AutoBackupInfo[];
  restoreAutoBackup: (key: string) => { ok: true } | { ok: false; error: string };
}

const Ctx = createContext<AppDataContextValue | null>(null);

const defaultRepo = new StorageRepository();
const defaultNow = () => new Date();

export function AppDataProvider({
  children,
  repository = defaultRepo,
  now = defaultNow,
}: {
  children: ReactNode;
  repository?: StorageRepository;
  now?: () => Date;
}) {
  const [loadResult] = useState<LoadResult>(() => repository.load());
  const [data, setData] = useState<AppData>(() => loadResult.data);
  const dataRef = useRef(data);
  const [celebrations, setCelebrations] = useState<AchievementDef[]>([]);
  const today = useToday();
  const todayRef = useRef(today);
  todayRef.current = today;

  useApplyTheme(data.settings.theme);

  const commit = useCallback(
    (updater: (prev: AppData) => AppData, opts: { silent?: boolean } = {}) => {
      const t = now();
      const changed = updater(dataRef.current);
      const { data: evaluated, unlocked } = evaluateAchievements(changed, todayRef.current, t);
      const next = { ...evaluated, updatedAt: t.toISOString() };
      dataRef.current = next;
      setData(next);
      try {
        repository.save(next);
      } catch {
        // Armazenamento cheio/bloqueado: os dados permanecem em memória nesta sessão.
      }
      if (unlocked.length && !opts.silent && next.settings.celebrations) {
        setCelebrations((q) => [...q, ...unlocked]);
      }
    },
    [repository, now],
  );

  // Reavalia ao abrir e na virada do dia (sem criar atividade).
  useEffect(() => {
    const { data: evaluated, unlocked } = evaluateAchievements(dataRef.current, today, now());
    if (evaluated !== dataRef.current) {
      dataRef.current = evaluated;
      setData(evaluated);
      repository.save(evaluated);
      if (unlocked.length && evaluated.settings.celebrations) setCelebrations((q) => [...q, ...unlocked]);
    }
  }, [today, repository, now]);

  const index = useMemo(() => buildActivityIndex(data), [data]);
  const streak = useMemo(
    () => computeStreak(trackedDayKeys(index), today, data.records.bestStreak),
    [index, today, data.records.bestStreak],
  );

  const value = useMemo<AppDataContextValue>(() => {
    return {
      data,
      today,
      index,
      streak,
      loadResult,
      persistent: repository.isPersistent,
      celebrations,
      dismissCelebration: () => setCelebrations((q) => q.slice(1)),
      addWater: (amount) => {
        let entry!: WaterEntry;
        commit((d) => {
          const r = hydration.addWater(d, amount, now());
          entry = r.entry;
          return r.data;
        });
        return entry;
      },
      removeWater: (id) => commit((d) => hydration.removeWater(d, id)),
      undoWater: () => {
        const r = hydration.undoLastWater(dataRef.current, todayRef.current);
        if (!r) return null;
        commit(() => r.data);
        return r.removed;
      },
      addMeal: (input) => commit((d) => meals.addMealLog(d, input, now()).data),
      removeMeal: (id) => commit((d) => meals.removeMealLog(d, id)),
      addFreeMeal: (input) => commit((d) => meals.addFreeMeal(d, input, now()).data),
      removeFreeMeal: (id) => commit((d) => meals.removeFreeMeal(d, id)),
      updateSettings: (patch) => commit((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      setMealTime: (slot, time) =>
        commit((d) => ({ ...d, settings: { ...d.settings, mealTimes: { ...d.settings.mealTimes, [slot]: time } } })),
      setWaterGoal: (goal) => commit((d) => hydration.setWaterGoal(d, goal, todayRef.current)),
      setDailyNote: (dateKey, note) =>
        commit((d) => {
          const dailyNotes = { ...d.dailyNotes };
          if (note.trim()) dailyNotes[dateKey] = note.slice(0, 1000);
          else delete dailyNotes[dateKey];
          return { ...d, dailyNotes };
        }),
      exportBackup: () => {
        const t = now();
        commit((d) => ({ ...d, counters: { ...d.counters, exports: d.counters.exports + 1 } }));
        return { fileName: backupFileName(t), content: serializeBackup(createBackup(dataRef.current, t)) };
      },
      importBackup: (text, mode) => {
        const parsed = parseBackup(text);
        if (!parsed.ok) return parsed;
        // Backup preventivo obrigatório antes de alterar qualquer dado.
        repository.save(dataRef.current);
        const backup = repository.backupCurrent(mode === 'replace' ? 'Antes de substituir por um backup importado' : 'Antes de mesclar um backup importado');
        if (!backup && (dataRef.current.mealLogs.length || dataRef.current.waterEntries.length || dataRef.current.freeMeals.length)) {
          return { ok: false, error: 'Não foi possível criar o backup preventivo dos dados atuais. A importação foi cancelada.' };
        }
        commit((d) => (mode === 'replace' ? parsed.data : mergeData(d, parsed.data, now())), { silent: true });
        return { ok: true, backup };
      },
      listAutoBackups: () => repository.listBackups(),
      restoreAutoBackup: (key) => {
        const payload = repository.readBackup(key);
        if (!payload) return { ok: false, error: 'Backup automático não encontrado.' };
        let raw: unknown;
        try {
          raw = JSON.parse(payload);
        } catch {
          return { ok: false, error: 'O backup automático está corrompido.' };
        }
        const text = JSON.stringify({ app: 'fitstreak', schemaVersion: (raw as { schemaVersion?: number })?.schemaVersion ?? 1, data: raw });
        const parsed = parseBackup(text);
        if (!parsed.ok) return parsed;
        repository.backupCurrent('Antes de restaurar um backup automático');
        commit(() => parsed.data, { silent: true });
        return { ok: true };
      },
    };
  }, [data, today, index, streak, loadResult, repository, celebrations, commit, now]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData deve ser usado dentro de AppDataProvider');
  return v;
}
