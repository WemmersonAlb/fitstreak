import type { AppData } from '../../types';
import { addDays, diffDays } from '../../utils/date';

export interface DayActivity {
  dateKey: string;
  mealCount: number;
  freeMealCount: number;
  waterMl: number;
  waterEntryCount: number;
  goalMl: number;
  goalMet: boolean;
  tracked: boolean;
  /** Motivos legíveis que tornam o dia acompanhado. */
  reasons: string[];
}

export interface StreakRun {
  start: string;
  end: string;
  length: number;
}

export interface StreakInfo {
  current: number;
  best: number;
  /** Hoje já tem atividade registrada. */
  todayTracked: boolean;
  /** A ofensiva está viva mas depende de registrar algo hoje. */
  atRisk: boolean;
  runs: StreakRun[];
  totalTrackedDays: number;
}

/** Agrupa atividades por dia. Um dia é acompanhado se tiver refeição, refeição livre ou água registrada. */
export function buildActivityIndex(data: AppData): Map<string, DayActivity> {
  const idx = new Map<string, DayActivity>();
  const get = (k: string): DayActivity => {
    let d = idx.get(k);
    if (!d) {
      d = {
        dateKey: k,
        mealCount: 0,
        freeMealCount: 0,
        waterMl: 0,
        waterEntryCount: 0,
        goalMl: data.settings.waterGoalMl,
        goalMet: false,
        tracked: false,
        reasons: [],
      };
      idx.set(k, d);
    }
    return d;
  };
  const lastGoalAt = new Map<string, { at: string; goal: number }>();
  for (const w of data.waterEntries) {
    const d = get(w.dateKey);
    d.waterMl += w.amountMl;
    d.waterEntryCount++;
    const prev = lastGoalAt.get(w.dateKey);
    if (!prev || w.createdAt > prev.at) lastGoalAt.set(w.dateKey, { at: w.createdAt, goal: w.goalMl });
  }
  for (const m of data.mealLogs) get(m.dateKey).mealCount++;
  for (const f of data.freeMeals) get(f.dateKey).freeMealCount++;

  for (const d of idx.values()) {
    const g = lastGoalAt.get(d.dateKey);
    if (g) d.goalMl = g.goal;
    d.goalMet = d.waterMl >= d.goalMl;
    if (d.mealCount) d.reasons.push(`${d.mealCount} refeição(ões) do plano registrada(s)`);
    if (d.freeMealCount) d.reasons.push('Refeição livre registrada (faz parte do plano)');
    if (d.waterEntryCount) d.reasons.push(`${d.waterEntryCount} registro(s) de água`);
    d.tracked = d.reasons.length > 0;
  }
  return idx;
}

export function trackedDayKeys(index: Map<string, DayActivity>): string[] {
  return Array.from(index.values())
    .filter((d) => d.tracked)
    .map((d) => d.dateKey)
    .sort();
}

export function computeRuns(sortedKeys: string[]): StreakRun[] {
  const runs: StreakRun[] = [];
  for (const k of sortedKeys) {
    const last = runs[runs.length - 1];
    if (last && diffDays(last.end, k) === 1) {
      last.end = k;
      last.length++;
    } else if (!last || last.end !== k) {
      runs.push({ start: k, end: k, length: 1 });
    }
  }
  return runs;
}

/**
 * A ofensiva atual termina hoje ou ontem (hoje ainda pode ser registrado).
 * Dias futuros (relógio adiantado em outro momento) são ignorados.
 */
export function computeStreak(sortedKeys: string[], today: string, storedBest = 0): StreakInfo {
  const keys = sortedKeys.filter((k) => k <= today);
  const runs = computeRuns(keys);
  const last = runs[runs.length - 1];
  const todayTracked = !!last && last.end === today;
  const alive = !!last && (last.end === today || last.end === addDays(today, -1));
  const current = alive ? last.length : 0;
  const best = Math.max(storedBest, ...runs.map((r) => r.length), 0);
  return {
    current,
    best,
    todayTracked,
    atRisk: alive && !todayTracked,
    runs,
    totalTrackedDays: keys.length,
  };
}

export const STREAK_MILESTONES = [1, 3, 7, 13, 14, 21, 30, 42, 50, 67, 75, 100, 180, 365];

export function nextMilestone(current: number): number | null {
  return STREAK_MILESTONES.find((m) => m > current) ?? null;
}

/** Série diária da ofensiva (valor da sequência em cada dia) para gráficos. */
export function streakSeries(sortedKeys: string[], from: string, to: string): { dateKey: string; streak: number }[] {
  const set = new Set(sortedKeys);
  const out: { dateKey: string; streak: number }[] = [];
  // Conta dias anteriores ao início para começar com o valor correto.
  let run = 0;
  let k = addDays(from, -1);
  while (set.has(k)) {
    run++;
    k = addDays(k, -1);
  }
  const n = diffDays(from, to);
  for (let i = 0; i <= n; i++) {
    const day = addDays(from, i);
    run = set.has(day) ? run + 1 : 0;
    out.push({ dateKey: day, streak: run });
  }
  return out;
}
