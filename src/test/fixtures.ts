import type { AppData, MealLog, WaterEntry, FreeMeal } from '../types';
import { createDefaultData } from '../services/storage/schema';

let n = 0;

export function water(dateKey: string, amountMl = 500, goalMl = 3300, hour = 12): WaterEntry {
  return {
    id: `w-${dateKey}-${++n}`,
    dateKey,
    amountMl,
    goalMl,
    // 15:00Z = 12:00 em Recife (UTC-3)
    createdAt: `${dateKey}T${String(hour + 3).padStart(2, '0')}:00:00.000Z`,
  };
}

export function meal(dateKey: string, partial: Partial<MealLog> = {}): MealLog {
  return {
    id: `m-${dateKey}-${++n}`,
    dateKey,
    slot: 'almoco',
    categoryId: 'almoco',
    kind: 'main',
    choices: [{ groupId: 'proteina', groupLabel: 'Proteína', food: 'Filé de frango grelhado', source: 'main' }],
    time: '12:00',
    notes: '',
    createdAt: `${dateKey}T15:00:00.000Z`,
    ...partial,
  };
}

export function freeMeal(dateKey: string, partial: Partial<FreeMeal> = {}): FreeMeal {
  return {
    id: `f-${dateKey}-${++n}`,
    dateKey,
    description: 'Pizza',
    notes: '',
    time: '20:00',
    createdAt: `${dateKey}T23:00:00.000Z`,
    ...partial,
  };
}

export function dataWith(partial: Partial<AppData> = {}): AppData {
  return { ...createDefaultData('2026-01-01T00:00:00.000Z'), ...partial };
}

export function days(from: string, count: number): string[] {
  const out: string[] = [];
  const [y, m, d] = from.split('-').map(Number);
  for (let i = 0; i < count; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}
