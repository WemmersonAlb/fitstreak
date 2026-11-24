import type { AppData, FreeMeal, MealCategory, MealChoice, MealLog, MealSlotId, MealSelectionKind } from '../../types';
import { MAX_TEXT_LENGTH } from '../../constants';
import { MEAL_SLOTS, getCategory } from '../../data/nutrition/plan';
import { addDays, isValidDateKey, isValidTimeHM, startOfWeek } from '../../utils/date';
import { newId } from '../../utils/format';
import { ValidationError } from '../hydration/hydration';

export interface MealLogInput {
  dateKey: string;
  categoryId: MealCategory['id'];
  kind: MealSelectionKind;
  choices?: MealChoice[];
  suggestionId?: string;
  otherDescription?: string;
  time: string;
  notes?: string;
}

/** Itens da opção principal de uma categoria, como escolhas. */
export function mainChoices(category: MealCategory): MealChoice[] {
  return category.groups.map((g) => ({
    groupId: g.id,
    groupLabel: g.label,
    food: g.main.food,
    source: 'main' as const,
  }));
}

export function addMealLog(data: AppData, input: MealLogInput, now: Date = new Date()): { data: AppData; log: MealLog } {
  const category = getCategory(input.categoryId);
  if (!category) throw new ValidationError('Categoria de refeição desconhecida.');
  if (!isValidDateKey(input.dateKey)) throw new ValidationError('Data inválida.');
  if (!isValidTimeHM(input.time)) throw new ValidationError('Horário inválido.');

  const log: MealLog = {
    id: newId('m'),
    dateKey: input.dateKey,
    slot: category.slot,
    categoryId: category.id,
    kind: input.kind,
    choices: [],
    time: input.time,
    notes: (input.notes ?? '').slice(0, MAX_TEXT_LENGTH),
    createdAt: now.toISOString(),
  };

  if (input.kind === 'main') {
    log.choices = mainChoices(category);
  } else if (input.kind === 'custom-plan') {
    if (!input.choices?.length) throw new ValidationError('Selecione os alimentos consumidos.');
    log.choices = input.choices;
  } else if (input.kind === 'suggestion') {
    const s = category.suggestions.find((x) => x.id === input.suggestionId);
    if (!s) throw new ValidationError('Selecione uma sugestão de preparo.');
    log.suggestionId = s.id;
    log.suggestionTitle = s.title;
  } else {
    const desc = (input.otherDescription ?? '').trim();
    if (!desc) throw new ValidationError('Descreva o que foi consumido.');
    log.otherDescription = desc.slice(0, MAX_TEXT_LENGTH);
  }
  return { data: { ...data, mealLogs: [...data.mealLogs, log] }, log };
}

export function removeMealLog(data: AppData, id: string): AppData {
  return { ...data, mealLogs: data.mealLogs.filter((m) => m.id !== id) };
}

export interface FreeMealInput {
  dateKey: string;
  description: string;
  notes?: string;
  slot?: MealSlotId;
  time: string;
}

export function addFreeMeal(data: AppData, input: FreeMealInput, now: Date = new Date()): { data: AppData; meal: FreeMeal } {
  if (!isValidDateKey(input.dateKey)) throw new ValidationError('Data inválida.');
  if (!isValidTimeHM(input.time)) throw new ValidationError('Horário inválido.');
  const description = input.description.trim();
  if (!description) throw new ValidationError('Conte o que você comeu na refeição livre.');
  const meal: FreeMeal = {
    id: newId('f'),
    dateKey: input.dateKey,
    description: description.slice(0, MAX_TEXT_LENGTH),
    notes: (input.notes ?? '').slice(0, MAX_TEXT_LENGTH),
    time: input.time,
    createdAt: now.toISOString(),
  };
  if (input.slot) meal.slot = input.slot;
  return { data: { ...data, freeMeals: [...data.freeMeals, meal] }, meal };
}

export function removeFreeMeal(data: AppData, id: string): AppData {
  return { ...data, freeMeals: data.freeMeals.filter((m) => m.id !== id) };
}

export function mealsForDay(data: AppData, dateKey: string): MealLog[] {
  return data.mealLogs.filter((m) => m.dateKey === dateKey).sort((a, b) => a.time.localeCompare(b.time));
}

export function freeMealsForDay(data: AppData, dateKey: string): FreeMeal[] {
  return data.freeMeals.filter((m) => m.dateKey === dateKey).sort((a, b) => a.time.localeCompare(b.time));
}

export type SlotState = 'done' | 'free' | 'pending';

export interface SlotStatus {
  slot: (typeof MEAL_SLOTS)[number];
  state: SlotState;
  logs: MealLog[];
  freeMeal?: FreeMeal;
}

export function slotStatuses(data: AppData, dateKey: string): SlotStatus[] {
  const logs = mealsForDay(data, dateKey);
  const free = freeMealsForDay(data, dateKey);
  return MEAL_SLOTS.map((slot) => {
    const slotLogs = logs.filter((l) => l.slot === slot.id);
    const freeMeal = free.find((f) => f.slot === slot.id);
    const state: SlotState = slotLogs.length ? 'done' : freeMeal ? 'free' : 'pending';
    return { slot, state, logs: slotLogs, freeMeal };
  });
}

/** Refeições livres da semana (segunda a domingo) que contém a data. */
export function freeMealsInWeek(data: AppData, dateKey: string): FreeMeal[] {
  const start = startOfWeek(dateKey);
  const end = addDays(start, 6);
  return data.freeMeals.filter((f) => f.dateKey >= start && f.dateKey <= end);
}

export function describeMealLog(log: MealLog): string {
  if (log.kind === 'suggestion') return log.suggestionTitle ?? 'Sugestão de preparo';
  if (log.kind === 'other') return log.otherDescription ?? 'Outra refeição';
  return log.choices.map((c) => c.food).join(' · ');
}
