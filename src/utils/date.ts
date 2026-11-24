/**
 * Datas do app são chaves locais "YYYY-MM-DD" no fuso America/Recife.
 * A aritmética de dias é feita em UTC puro sobre a chave, sem depender
 * do fuso configurado no dispositivo.
 */
export const APP_TIME_ZONE = 'America/Recife';

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const hourFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  hour12: false,
});

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDateKey(date: Date | number = Date.now()): string {
  const parts = dateFmt.formatToParts(typeof date === 'number' ? new Date(date) : date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function toTimeHM(date: Date | number = Date.now()): string {
  // Alguns motores retornam "24:05" para meia-noite.
  return timeFmt.format(typeof date === 'number' ? new Date(date) : date).replace(/^24/, '00');
}

export function hourInAppZone(date: Date | number = Date.now()): number {
  return Number(hourFmt.format(typeof date === 'number' ? new Date(date) : date)) % 24;
}

export function isValidDateKey(key: unknown): key is string {
  if (typeof key !== 'string') return false;
  const m = DATE_KEY_RE.exec(key);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

export function isValidTimeHM(v: unknown): v is string {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

function keyToUTC(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcToKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_MS = 86_400_000;

export function addDays(key: string, n: number): string {
  return utcToKey(keyToUTC(key) + n * DAY_MS);
}

/** Diferença em dias (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((keyToUTC(b) - keyToUTC(a)) / DAY_MS);
}

/** 0 = domingo ... 6 = sábado */
export function weekday(key: string): number {
  return new Date(keyToUTC(key)).getUTCDay();
}

/** Semana iniciando na segunda-feira. */
export function startOfWeek(key: string): string {
  const wd = weekday(key);
  return addDays(key, wd === 0 ? -6 : 1 - wd);
}

export function startOfMonth(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

export function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export function rangeKeys(from: string, to: string): string[] {
  const out: string[] = [];
  const n = diffDays(from, to);
  for (let i = 0; i <= n; i++) out.push(addDays(from, i));
  return out;
}

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function monthName(month1: number): string {
  return MONTHS[month1 - 1];
}

export function formatLongDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${WEEKDAYS[weekday(key)]}, ${d} de ${MONTHS[m - 1]} de ${y}`;
}

export function formatShortDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

export function formatFullShort(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
