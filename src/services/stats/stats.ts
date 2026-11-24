import type { AppData } from '../../types';
import { addDays, diffDays, formatShortDate, rangeKeys, startOfWeek } from '../../utils/date';
import { buildActivityIndex, computeStreak, streakSeries, trackedDayKeys, type DayActivity } from '../streak/streak';

export interface WaterPoint {
  dateKey: string;
  label: string;
  ml: number;
  goal: number;
  goalMet: boolean;
}

export interface OverallStats {
  currentStreak: number;
  bestStreak: number;
  trackedDays: number;
  totalMeals: number;
  totalFreeMeals: number;
  totalWaterMl: number;
  waterDays: number;
  avgWaterMl: number;
  goalDays: number;
  goalRate: number;
}

export function overallStats(data: AppData, today: string, index = buildActivityIndex(data)): OverallStats {
  const keys = trackedDayKeys(index).filter((k) => k <= today);
  const streak = computeStreak(keys, today, data.records.bestStreak);
  let totalWaterMl = 0;
  let waterDays = 0;
  let goalDays = 0;
  for (const d of index.values()) {
    if (!d.waterEntryCount) continue;
    totalWaterMl += d.waterMl;
    waterDays++;
    if (d.goalMet) goalDays++;
  }
  return {
    currentStreak: streak.current,
    bestStreak: streak.best,
    trackedDays: keys.length,
    totalMeals: data.mealLogs.length,
    totalFreeMeals: data.freeMeals.length,
    totalWaterMl,
    waterDays,
    // Média considera apenas dias com registro de água: não penaliza dias sem dados.
    avgWaterMl: waterDays ? totalWaterMl / waterDays : 0,
    goalDays,
    goalRate: waterDays ? goalDays / waterDays : 0,
  };
}

export function waterSeries(data: AppData, today: string, days: number, index = buildActivityIndex(data)): WaterPoint[] {
  const from = addDays(today, -(days - 1));
  return rangeKeys(from, today).map((k) => {
    const d: DayActivity | undefined = index.get(k);
    const goal = d?.goalMl ?? data.settings.waterGoalMl;
    const ml = d?.waterMl ?? 0;
    return { dateKey: k, label: formatShortDate(k), ml, goal, goalMet: ml > 0 && ml >= goal };
  });
}

export interface WeekPoint {
  weekStart: string;
  label: string;
  meals: number;
  freeMeals: number;
  trackedDays: number;
  goalDays: number;
}

export function weeklySeries(data: AppData, today: string, weeks: number, index = buildActivityIndex(data)): WeekPoint[] {
  const lastWeek = startOfWeek(today);
  const out: WeekPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = addDays(lastWeek, -7 * i);
    const we = addDays(ws, 6);
    const p: WeekPoint = { weekStart: ws, label: formatShortDate(ws), meals: 0, freeMeals: 0, trackedDays: 0, goalDays: 0 };
    for (const k of rangeKeys(ws, we)) {
      const d = index.get(k);
      if (!d) continue;
      p.meals += d.mealCount;
      p.freeMeals += d.freeMealCount;
      if (d.tracked) p.trackedDays++;
      if (d.waterEntryCount && d.goalMet) p.goalDays++;
    }
    out.push(p);
  }
  return out;
}

export interface MonthPoint {
  month: string;
  label: string;
  trackedDays: number;
  meals: number;
  waterL: number;
  goalDays: number;
}

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function monthlySeries(data: AppData, today: string, months: number, index = buildActivityIndex(data)): MonthPoint[] {
  const [y, m] = today.split('-').map(Number);
  const out: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const total = y * 12 + (m - 1) - i;
    const yy = Math.floor(total / 12);
    const mm = (total % 12) + 1;
    const prefix = `${yy}-${String(mm).padStart(2, '0')}`;
    out.push({ month: prefix, label: `${MONTH_SHORT[mm - 1]}/${String(yy).slice(2)}`, trackedDays: 0, meals: 0, waterL: 0, goalDays: 0 });
  }
  const byMonth = new Map(out.map((p) => [p.month, p]));
  for (const d of index.values()) {
    const p = byMonth.get(d.dateKey.slice(0, 7));
    if (!p) continue;
    if (d.tracked) p.trackedDays++;
    p.meals += d.mealCount;
    p.waterL += d.waterMl / 1000;
    if (d.waterEntryCount && d.goalMet) p.goalDays++;
  }
  out.forEach((p) => (p.waterL = Math.round(p.waterL * 10) / 10));
  return out;
}

export function streakEvolution(data: AppData, today: string, days: number, index = buildActivityIndex(data)) {
  const keys = trackedDayKeys(index).filter((k) => k <= today);
  const from = addDays(today, -(days - 1));
  return streakSeries(keys, from, today).map((p) => ({ ...p, label: formatShortDate(p.dateKey) }));
}

/** Há dados suficientes no intervalo para exibir um gráfico? */
export function hasDataInRange(index: Map<string, DayActivity>, today: string, days: number): boolean {
  for (const k of index.keys()) {
    const diff = diffDays(k, today);
    if (diff >= 0 && diff < days) return true;
  }
  return false;
}
