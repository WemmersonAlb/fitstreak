import type { AppData } from '../../types';
import { MEAL_SLOTS } from '../../data/nutrition/plan';
import { FREE_MEALS_PER_WEEK } from '../../constants';
import { addDays, startOfWeek, weekday } from '../../utils/date';
import { buildActivityIndex, computeStreak, trackedDayKeys, type DayActivity, type StreakInfo } from '../streak/streak';

export interface AchievementContext {
  today: string;
  index: Map<string, DayActivity>;
  trackedKeys: string[];
  streak: StreakInfo;
  totalWaterMl: number;
  goalDays: number;
  mealCount: number;
  mealDays: number;
  fullDays: number;
  freeMealCount: number;
  maxFreeMealsInAWeek: number;
  substitutionMeals: number;
  distinctSuggestions: number;
  plannedWeek: boolean;
  weekendCombo: boolean;
  newYearStreak: boolean;
  waterOnFreeMealDay: boolean;
  waterUndos: number;
  exports: number;
}

export function buildAchievementContext(data: AppData, today: string): AchievementContext {
  const index = buildActivityIndex(data);
  const trackedKeys = trackedDayKeys(index).filter((k) => k <= today);
  const trackedSet = new Set(trackedKeys);
  const streak = computeStreak(trackedKeys, today, data.records.bestStreak);

  let totalWaterMl = 0;
  let goalDays = 0;
  let waterOnFreeMealDay = false;
  for (const d of index.values()) {
    totalWaterMl += d.waterMl;
    if (d.waterEntryCount && d.goalMet) {
      goalDays++;
      if (d.freeMealCount) waterOnFreeMealDay = true;
    }
  }

  const mealDays = new Set(data.mealLogs.map((m) => m.dateKey)).size;

  // Dia completo: todos os momentos do dia com refeição registrada ou ocupados por refeição livre.
  const slotsByDay = new Map<string, Set<string>>();
  const touch = (k: string, s: string) => {
    if (!slotsByDay.has(k)) slotsByDay.set(k, new Set());
    slotsByDay.get(k)!.add(s);
  };
  data.mealLogs.forEach((m) => touch(m.dateKey, m.slot));
  data.freeMeals.forEach((f) => f.slot && touch(f.dateKey, f.slot));
  let fullDays = 0;
  for (const set of slotsByDay.values()) if (MEAL_SLOTS.every((s) => set.has(s.id))) fullDays++;

  const freeByWeek = new Map<string, number>();
  for (const f of data.freeMeals) {
    const w = startOfWeek(f.dateKey);
    freeByWeek.set(w, (freeByWeek.get(w) ?? 0) + 1);
  }
  const maxFreeMealsInAWeek = Math.max(0, ...freeByWeek.values());

  // Semana planejada: segunda a domingo completos, todos acompanhados e no máximo 2 refeições livres.
  let plannedWeek = false;
  const weeks = new Set(trackedKeys.map(startOfWeek));
  for (const w of weeks) {
    const end = addDays(w, 6);
    if (end > today) continue;
    let all = true;
    for (let i = 0; i < 7 && all; i++) all = trackedSet.has(addDays(w, i));
    if (all && (freeByWeek.get(w) ?? 0) <= FREE_MEALS_PER_WEEK) {
      plannedWeek = true;
      break;
    }
  }

  const weekendCombo = trackedKeys.some((k) => weekday(k) === 6 && trackedSet.has(addDays(k, 1)));
  const newYearStreak = trackedKeys.some((k) => k.endsWith('-12-31') && trackedSet.has(addDays(k, 1)));

  const substitutionMeals = data.mealLogs.filter(
    (m) => m.kind === 'custom-plan' && m.choices.some((c) => c.source !== 'main'),
  ).length;
  const distinctSuggestions = new Set(data.mealLogs.filter((m) => m.suggestionId).map((m) => m.suggestionId)).size;

  return {
    today,
    index,
    trackedKeys,
    streak,
    totalWaterMl,
    goalDays,
    mealCount: data.mealLogs.length,
    mealDays,
    fullDays,
    freeMealCount: data.freeMeals.length,
    maxFreeMealsInAWeek,
    substitutionMeals,
    distinctSuggestions,
    plannedWeek,
    weekendCombo,
    newYearStreak,
    waterOnFreeMealDay,
    waterUndos: data.counters.waterUndos,
    exports: data.counters.exports,
  };
}
