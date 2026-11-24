import { describe, it, expect } from 'vitest';
import { backupFileName, createBackup, mergeData, parseBackup, serializeBackup } from './backup';
import { dataWith, freeMeal, meal, water } from '../../test/fixtures';

describe('exportação', () => {
  it('gera arquivo com metadados e todos os dados', () => {
    const data = dataWith({ waterEntries: [water('2026-05-01')], mealLogs: [meal('2026-05-01')], freeMeals: [freeMeal('2026-05-02')] });
    const now = new Date('2026-05-03T02:00:00Z'); // ainda dia 02 em Recife
    const file = createBackup(data, now);
    expect(file.app).toBe('fitstreak');
    expect(file.schemaVersion).toBe(1);
    expect(file.exportedAt).toBe(now.toISOString());
    expect(file.data.settings.waterGoalMl).toBe(3300);
    expect(backupFileName(now)).toBe('fitstreak-backup-2026-05-02.json');
  });

  it('ida e volta preserva os dados', () => {
    const data = dataWith({
      waterEntries: [water('2026-05-01')],
      mealLogs: [meal('2026-05-01')],
      achievements: { 'streak-1': { unlockedAt: '2026-05-01T12:00:00.000Z' } },
      records: { bestStreak: 4, bestStreakEnd: '2026-05-01' },
    });
    const parsed = parseBackup(serializeBackup(createBackup(data)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data).toEqual(data);
    expect(parsed.summary.mealLogs).toBe(1);
    expect(parsed.summary.bestStreak).toBe(4);
  });
});

describe('importação', () => {
  it('rejeita arquivos inválidos com mensagens claras', () => {
    expect(parseBackup('não é json')).toEqual({ ok: false, error: 'O arquivo não é um JSON válido.' });
    expect(parseBackup('[]').ok).toBe(false);
    expect(parseBackup('{"foo":1}')).toMatchObject({ ok: false, error: expect.stringMatching(/não parece/) });
    expect(parseBackup(JSON.stringify({ app: 'fitstreak', schemaVersion: 99, data: {} }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/mais nova/),
    });
  });

  it('descarta registros inválidos e informa', () => {
    const text = JSON.stringify({
      app: 'fitstreak',
      schemaVersion: 1,
      exportedAt: '2026-05-01T00:00:00.000Z',
      data: {
        schemaVersion: 1,
        waterEntries: [water('2026-05-01'), { id: 'x', dateKey: 'ontem', amountMl: 'muito' }],
        mealLogs: [meal('2026-05-01'), { id: 'evil', __proto__: { polluted: true } }],
        campoNovo: { a: 1 },
      },
    });
    const r = parseBackup(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.waterEntries).toHaveLength(1);
    expect(r.report.dropped.waterEntries).toBe(1);
    expect(r.report.dropped.mealLogs).toBe(1);
    expect(r.report.unknownKeys).toEqual(['campoNovo']);
    expect(r.data.extras).toEqual({ campoNovo: { a: 1 } });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('mesclagem', () => {
  it('une registros por id sem duplicar e mantém o maior recorde', () => {
    const shared = meal('2026-05-01');
    const current = dataWith({
      mealLogs: [shared],
      waterEntries: [water('2026-05-01')],
      records: { bestStreak: 3 },
      achievements: { 'streak-1': { unlockedAt: '2026-05-02T00:00:00.000Z' } },
      dailyNotes: { '2026-05-01': 'nota atual' },
    });
    const incoming = dataWith({
      mealLogs: [shared, meal('2026-04-01')],
      freeMeals: [freeMeal('2026-04-02')],
      records: { bestStreak: 9, bestStreakEnd: '2026-04-09' },
      achievements: {
        'streak-1': { unlockedAt: '2026-04-01T00:00:00.000Z' },
        'streak-7': { unlockedAt: '2026-04-07T00:00:00.000Z' },
      },
      dailyNotes: { '2026-05-01': 'nota importada', '2026-04-01': 'antiga' },
    });
    incoming.settings = { ...incoming.settings, waterGoalMl: 2000 };
    const merged = mergeData(current, incoming);
    expect(merged.mealLogs).toHaveLength(2);
    expect(merged.waterEntries).toHaveLength(1);
    expect(merged.freeMeals).toHaveLength(1);
    expect(merged.records.bestStreak).toBe(9);
    expect(merged.achievements['streak-1'].unlockedAt).toBe('2026-04-01T00:00:00.000Z');
    expect(merged.achievements['streak-7']).toBeDefined();
    expect(merged.settings.waterGoalMl).toBe(3300);
    expect(merged.dailyNotes['2026-05-01']).toBe('nota atual\nnota importada');
    expect(merged.dailyNotes['2026-04-01']).toBe('antiga');
  });
});
