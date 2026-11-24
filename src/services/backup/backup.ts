import type { AppData } from '../../types';
import { MAX_IMPORT_BYTES, SCHEMA_VERSION } from '../../constants';
import { PLAN_VERSION } from '../../data/nutrition/plan';
import { toDateKey } from '../../utils/date';
import { SchemaError, validateAppData, type ValidationReport } from '../storage/schema';

export const BACKUP_APP_ID = 'fitstreak';

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  planVersion: string;
  data: AppData;
}

export interface BackupSummary {
  exportedAt: string | null;
  schemaVersion: number;
  planVersion: string | null;
  waterEntries: number;
  mealLogs: number;
  freeMeals: number;
  achievements: number;
  bestStreak: number;
  firstDay: string | null;
  lastDay: string | null;
}

export type ParseResult =
  | { ok: true; data: AppData; summary: BackupSummary; report: ValidationReport }
  | { ok: false; error: string };

export function createBackup(data: AppData, now: Date = new Date()): BackupFile {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    planVersion: PLAN_VERSION,
    data,
  };
}

export function backupFileName(now: Date = new Date()): string {
  return `fitstreak-backup-${toDateKey(now)}.json`;
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

function summarize(data: AppData, exportedAt: string | null, schemaVersion: number, planVersion: string | null): BackupSummary {
  const days = [
    ...data.waterEntries.map((w) => w.dateKey),
    ...data.mealLogs.map((m) => m.dateKey),
    ...data.freeMeals.map((f) => f.dateKey),
  ].sort();
  return {
    exportedAt,
    schemaVersion,
    planVersion,
    waterEntries: data.waterEntries.length,
    mealLogs: data.mealLogs.length,
    freeMeals: data.freeMeals.length,
    achievements: Object.keys(data.achievements).length,
    bestStreak: data.records.bestStreak,
    firstDay: days[0] ?? null,
    lastDay: days[days.length - 1] ?? null,
  };
}

/** Lê o texto de um arquivo de backup. Apenas JSON.parse — nada é executado. */
export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'Arquivo muito grande para ser um backup do FitStreak.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' };
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'Estrutura de backup não reconhecida.' };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.app !== BACKUP_APP_ID || typeof obj.data !== 'object' || obj.data === null) {
    return { ok: false, error: 'Este arquivo não parece ser um backup do FitStreak.' };
  }
  const fileVersion = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : NaN;
  if (!Number.isInteger(fileVersion) || fileVersion < 0) {
    return { ok: false, error: 'O backup não informa uma versão de esquema válida.' };
  }
  if (fileVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Backup criado por uma versão mais nova do FitStreak (esquema ${fileVersion}). Atualize o app para importar.`,
    };
  }
  try {
    const { data, report } = validateAppData(obj.data);
    const exportedAt = typeof obj.exportedAt === 'string' && !Number.isNaN(Date.parse(obj.exportedAt)) ? obj.exportedAt : null;
    const planVersion = typeof obj.planVersion === 'string' ? obj.planVersion : null;
    if (planVersion && planVersion !== PLAN_VERSION) {
      report.warnings.push('O backup foi feito com outra versão do plano alimentar. Os registros serão mantidos como estão.');
    }
    return { ok: true, data, summary: summarize(data, exportedAt, fileVersion, planVersion), report };
  } catch (e) {
    return { ok: false, error: e instanceof SchemaError ? e.message : 'Não foi possível validar o backup.' };
  }
}

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map(a.map((x) => [x.id, x]));
  for (const x of b) if (!map.has(x.id)) map.set(x.id, x);
  return Array.from(map.values());
}

/**
 * Mescla dados importados com os atuais. Registros são unidos por id (sem duplicar).
 * Configurações atuais são mantidas; conquistas ficam com a data mais antiga;
 * recordes ficam com o maior valor.
 */
export function mergeData(current: AppData, incoming: AppData, now: Date = new Date()): AppData {
  const achievements = { ...current.achievements };
  for (const [id, a] of Object.entries(incoming.achievements)) {
    const mine = achievements[id];
    if (!mine || a.unlockedAt < mine.unlockedAt) achievements[id] = a;
  }
  const dailyNotes = { ...current.dailyNotes };
  for (const [k, v] of Object.entries(incoming.dailyNotes)) {
    if (!dailyNotes[k]) dailyNotes[k] = v;
    else if (dailyNotes[k] !== v) dailyNotes[k] = `${dailyNotes[k]}\n${v}`;
  }
  const records =
    incoming.records.bestStreak > current.records.bestStreak ? { ...incoming.records } : { ...current.records };
  const extras = { ...(incoming.extras ?? {}), ...(current.extras ?? {}) };

  const merged: AppData = {
    ...current,
    createdAt: current.createdAt < incoming.createdAt ? current.createdAt : incoming.createdAt,
    updatedAt: now.toISOString(),
    waterEntries: mergeById(current.waterEntries, incoming.waterEntries),
    mealLogs: mergeById(current.mealLogs, incoming.mealLogs),
    freeMeals: mergeById(current.freeMeals, incoming.freeMeals),
    dailyNotes,
    achievements,
    records,
    counters: {
      waterUndos: Math.max(current.counters.waterUndos, incoming.counters.waterUndos),
      exports: Math.max(current.counters.exports, incoming.counters.exports),
    },
  };
  if (Object.keys(extras).length) merged.extras = extras;
  return merged;
}
