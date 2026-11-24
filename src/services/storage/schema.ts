import type {
  AppData,
  Counters,
  FreeMeal,
  MealCategoryId,
  MealChoice,
  MealLog,
  MealSelectionKind,
  MealSlotId,
  Records,
  Settings,
  ThemePreference,
  UnlockedAchievement,
  WaterEntry,
} from '../../types';
import {
  DEFAULT_WATER_GOAL_ML,
  MAX_TEXT_LENGTH,
  MAX_WATER_ENTRY_ML,
  MAX_WATER_GOAL_ML,
  MIN_WATER_GOAL_ML,
  SCHEMA_VERSION,
} from '../../constants';
import { isValidDateKey, isValidTimeHM } from '../../utils/date';

export const SLOT_IDS: MealSlotId[] = ['cafe', 'almoco', 'lanche', 'jantar', 'ceia'];
export const CATEGORY_IDS: MealCategoryId[] = [
  'cafe_raiz', 'cafe', 'almoco_feijao', 'almoco', 'lanche', 'jantar', 'jantar_raiz', 'ceia',
];
const KINDS: MealSelectionKind[] = ['main', 'custom-plan', 'suggestion', 'other'];
const THEMES: ThemePreference[] = ['dark', 'light', 'system'];
const KNOWN_KEYS = new Set([
  'schemaVersion', 'createdAt', 'updatedAt', 'settings', 'waterEntries', 'mealLogs', 'freeMeals',
  'dailyNotes', 'achievements', 'records', 'counters', 'extras',
]);

export interface ValidationReport {
  /** Itens inválidos descartados, por coleção. */
  dropped: Record<string, number>;
  /** Chaves desconhecidas preservadas em `extras`. */
  unknownKeys: string[];
  warnings: string[];
}

export class SchemaError extends Error {}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));
const text = (v: unknown, max = MAX_TEXT_LENGTH): string => (isStr(v) ? v.slice(0, max) : '');
const isPosInt = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function defaultSettings(): Settings {
  return {
    theme: 'dark',
    waterGoalMl: DEFAULT_WATER_GOAL_ML,
    userName: '',
    mealTimes: { cafe: '', almoco: '', lanche: '', jantar: '', ceia: '' },
    celebrations: true,
  };
}

export function createDefaultData(nowIso: string = new Date().toISOString()): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: nowIso,
    updatedAt: nowIso,
    settings: defaultSettings(),
    waterEntries: [],
    mealLogs: [],
    freeMeals: [],
    dailyNotes: {},
    achievements: {},
    records: { bestStreak: 0 },
    counters: { waterUndos: 0, exports: 0 },
  };
}

function sanitizeSettings(raw: unknown, report: ValidationReport): Settings {
  const def = defaultSettings();
  if (!isObj(raw)) {
    if (raw !== undefined) report.warnings.push('Configurações inválidas foram redefinidas para o padrão.');
    return def;
  }
  const goal = raw.waterGoalMl;
  const mealTimes = { ...def.mealTimes };
  if (isObj(raw.mealTimes)) {
    for (const slot of SLOT_IDS) {
      const t = raw.mealTimes[slot];
      if (isValidTimeHM(t)) mealTimes[slot] = t;
    }
  }
  return {
    theme: THEMES.includes(raw.theme as ThemePreference) ? (raw.theme as ThemePreference) : def.theme,
    waterGoalMl:
      typeof goal === 'number' && goal >= MIN_WATER_GOAL_ML && goal <= MAX_WATER_GOAL_ML
        ? Math.round(goal)
        : def.waterGoalMl,
    userName: text(raw.userName, 40),
    mealTimes,
    celebrations: typeof raw.celebrations === 'boolean' ? raw.celebrations : true,
  };
}

function sanitizeWater(v: unknown): WaterEntry | null {
  if (!isObj(v)) return null;
  const { id, dateKey, amountMl, createdAt, goalMl } = v;
  if (!isStr(id) || !id || !isValidDateKey(dateKey) || !isIso(createdAt)) return null;
  if (typeof amountMl !== 'number' || !Number.isFinite(amountMl) || amountMl <= 0 || amountMl > MAX_WATER_ENTRY_ML)
    return null;
  return {
    id,
    dateKey,
    amountMl: Math.round(amountMl),
    createdAt,
    goalMl:
      typeof goalMl === 'number' && goalMl >= MIN_WATER_GOAL_ML && goalMl <= MAX_WATER_GOAL_ML
        ? goalMl
        : DEFAULT_WATER_GOAL_ML,
  };
}

function sanitizeChoice(v: unknown): MealChoice | null {
  if (!isObj(v)) return null;
  const source = v.source;
  if (source !== 'main' && source !== 'substitution' && source !== 'group') return null;
  if (!isStr(v.food) || !v.food) return null;
  return { groupId: text(v.groupId, 60), groupLabel: text(v.groupLabel, 60), food: text(v.food, 300), source };
}

function sanitizeMeal(v: unknown): MealLog | null {
  if (!isObj(v)) return null;
  if (!isStr(v.id) || !v.id || !isValidDateKey(v.dateKey) || !isIso(v.createdAt)) return null;
  if (!SLOT_IDS.includes(v.slot as MealSlotId)) return null;
  if (!CATEGORY_IDS.includes(v.categoryId as MealCategoryId)) return null;
  if (!KINDS.includes(v.kind as MealSelectionKind)) return null;
  const choices = Array.isArray(v.choices)
    ? v.choices.map(sanitizeChoice).filter((c): c is MealChoice => c !== null)
    : [];
  const log: MealLog = {
    id: v.id,
    dateKey: v.dateKey,
    slot: v.slot as MealSlotId,
    categoryId: v.categoryId as MealCategoryId,
    kind: v.kind as MealSelectionKind,
    choices,
    time: isValidTimeHM(v.time) ? v.time : '00:00',
    notes: text(v.notes),
    createdAt: v.createdAt,
  };
  if (isStr(v.suggestionId)) log.suggestionId = text(v.suggestionId, 60);
  if (isStr(v.suggestionTitle)) log.suggestionTitle = text(v.suggestionTitle, 120);
  if (isStr(v.otherDescription)) log.otherDescription = text(v.otherDescription);
  return log;
}

function sanitizeFreeMeal(v: unknown): FreeMeal | null {
  if (!isObj(v)) return null;
  if (!isStr(v.id) || !v.id || !isValidDateKey(v.dateKey) || !isIso(v.createdAt)) return null;
  const meal: FreeMeal = {
    id: v.id,
    dateKey: v.dateKey,
    description: text(v.description),
    notes: text(v.notes),
    time: isValidTimeHM(v.time) ? v.time : '00:00',
    createdAt: v.createdAt,
  };
  if (SLOT_IDS.includes(v.slot as MealSlotId)) meal.slot = v.slot as MealSlotId;
  return meal;
}

function sanitizeList<T>(
  raw: unknown,
  name: string,
  fn: (v: unknown) => T | null,
  report: ValidationReport,
  idOf: (t: T) => string,
): T[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    report.warnings.push(`O campo "${name}" não era uma lista e foi ignorado.`);
    return [];
  }
  const seen = new Set<string>();
  const out: T[] = [];
  let dropped = 0;
  for (const item of raw) {
    const ok = fn(item);
    if (!ok || seen.has(idOf(ok))) {
      dropped++;
      continue;
    }
    seen.add(idOf(ok));
    out.push(ok);
  }
  if (dropped) report.dropped[name] = dropped;
  return out;
}

function sanitizeRecordMap<T>(raw: unknown, fn: (k: string, v: unknown) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const ok = fn(k, v);
    if (ok !== null) out[k] = ok;
  }
  return out;
}

/** Converte dados de versões anteriores para o formato atual. */
export function migrate(raw: Obj): Obj {
  const version = raw.schemaVersion;
  if (version === undefined || version === null) {
    // v0: dados sem versão (pré-lançamento). Campos faltantes recebem padrão na sanitização.
    return { ...raw, schemaVersion: 1 };
  }
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
    throw new SchemaError('Versão de esquema inválida.');
  }
  if (version > SCHEMA_VERSION) {
    throw new SchemaError(
      `Estes dados foram criados por uma versão mais nova do FitStreak (esquema ${version}). Atualize o aplicativo antes de importar.`,
    );
  }
  let current: Obj = raw;
  // Adicione aqui os passos futuros: if (current.schemaVersion === 1) current = migrateV1toV2(current);
  if (current.schemaVersion === 0) current = { ...current, schemaVersion: 1 };
  return current;
}

/**
 * Valida, migra e sanitiza um objeto desconhecido.
 * Lança SchemaError apenas quando o conteúdo não é aproveitável.
 */
export function validateAppData(raw: unknown): { data: AppData; report: ValidationReport } {
  if (!isObj(raw)) throw new SchemaError('O conteúdo não é um objeto de dados do FitStreak.');
  const report: ValidationReport = { dropped: {}, unknownKeys: [], warnings: [] };
  const m = migrate(raw);
  const nowIso = new Date().toISOString();

  const extras: Record<string, unknown> = isObj(m.extras) ? { ...m.extras } : {};
  for (const key of Object.keys(m)) {
    if (!KNOWN_KEYS.has(key)) {
      report.unknownKeys.push(key);
      extras[key] = m[key];
    }
  }

  const recordsRaw = isObj(m.records) ? m.records : {};
  const records: Records = {
    bestStreak: isPosInt(recordsRaw.bestStreak) ? Math.floor(recordsRaw.bestStreak) : 0,
  };
  if (isValidDateKey(recordsRaw.bestStreakEnd)) records.bestStreakEnd = recordsRaw.bestStreakEnd;

  const countersRaw = isObj(m.counters) ? m.counters : {};
  const counters: Counters = {
    waterUndos: isPosInt(countersRaw.waterUndos) ? Math.floor(countersRaw.waterUndos) : 0,
    exports: isPosInt(countersRaw.exports) ? Math.floor(countersRaw.exports) : 0,
  };

  const data: AppData = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: isIso(m.createdAt) ? m.createdAt : nowIso,
    updatedAt: isIso(m.updatedAt) ? m.updatedAt : nowIso,
    settings: sanitizeSettings(m.settings, report),
    waterEntries: sanitizeList(m.waterEntries, 'waterEntries', sanitizeWater, report, (w) => w.id),
    mealLogs: sanitizeList(m.mealLogs, 'mealLogs', sanitizeMeal, report, (x) => x.id),
    freeMeals: sanitizeList(m.freeMeals, 'freeMeals', sanitizeFreeMeal, report, (x) => x.id),
    dailyNotes: sanitizeRecordMap(m.dailyNotes, (k, v) => (isValidDateKey(k) && isStr(v) ? text(v) : null)),
    achievements: sanitizeRecordMap<UnlockedAchievement>(m.achievements, (_k, v) =>
      isObj(v) && isIso(v.unlockedAt) ? { unlockedAt: v.unlockedAt } : null,
    ),
    records,
    counters,
  };
  if (Object.keys(extras).length) data.extras = extras;
  return { data, report };
}

export function reportHasIssues(r: ValidationReport): boolean {
  return Object.keys(r.dropped).length > 0 || r.unknownKeys.length > 0 || r.warnings.length > 0;
}
