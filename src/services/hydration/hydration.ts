import type { AppData, WaterEntry } from '../../types';
import { MAX_WATER_ENTRY_ML, MAX_WATER_GOAL_ML, MIN_WATER_GOAL_ML } from '../../constants';
import { toDateKey } from '../../utils/date';
import { newId } from '../../utils/format';

export class ValidationError extends Error {}

export function validateWaterAmount(amount: number): void {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
    throw new ValidationError('Informe uma quantidade inteira maior que zero.');
  }
  if (amount > MAX_WATER_ENTRY_ML) {
    throw new ValidationError(`Cada registro pode ter no máximo ${MAX_WATER_ENTRY_ML} ml.`);
  }
}

export function addWater(data: AppData, amountMl: number, now: Date = new Date()): { data: AppData; entry: WaterEntry } {
  validateWaterAmount(amountMl);
  const entry: WaterEntry = {
    id: newId('w'),
    dateKey: toDateKey(now),
    amountMl,
    createdAt: now.toISOString(),
    goalMl: data.settings.waterGoalMl,
  };
  return { data: { ...data, waterEntries: [...data.waterEntries, entry] }, entry };
}

export function removeWater(data: AppData, id: string): AppData {
  return { ...data, waterEntries: data.waterEntries.filter((w) => w.id !== id) };
}

export function entriesForDay(data: AppData, dateKey: string): WaterEntry[] {
  return data.waterEntries
    .filter((w) => w.dateKey === dateKey)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Desfaz o último registro do dia informado. Retorna null se não houver o que desfazer. */
export function undoLastWater(data: AppData, dateKey: string): { data: AppData; removed: WaterEntry } | null {
  const list = entriesForDay(data, dateKey);
  const last = list[list.length - 1];
  if (!last) return null;
  return {
    data: {
      ...removeWater(data, last.id),
      counters: { ...data.counters, waterUndos: data.counters.waterUndos + 1 },
    },
    removed: last,
  };
}

export function totalForDay(data: AppData, dateKey: string): number {
  return entriesForDay(data, dateKey).reduce((s, w) => s + w.amountMl, 0);
}

export function hydrationProgress(consumed: number, goal: number) {
  const ratio = goal > 0 ? consumed / goal : 0;
  return {
    consumed,
    goal,
    ratio,
    percent: Math.min(100, Math.round(ratio * 100)),
    remaining: Math.max(0, goal - consumed),
    goalMet: consumed >= goal,
  };
}

export function setWaterGoal(data: AppData, goal: number, today: string = toDateKey()): AppData {
  if (!Number.isInteger(goal) || goal < MIN_WATER_GOAL_ML || goal > MAX_WATER_GOAL_ML) {
    throw new ValidationError(`A meta deve estar entre ${MIN_WATER_GOAL_ML} e ${MAX_WATER_GOAL_ML} ml.`);
  }
  // A meta do dia atual acompanha a nova configuração; dias anteriores mantêm a meta da época.
  return {
    ...data,
    settings: { ...data.settings, waterGoalMl: goal },
    waterEntries: data.waterEntries.map((w) => (w.dateKey === today ? { ...w, goalMl: goal } : w)),
  };
}
