import { describe, it, expect } from 'vitest';
import { addWater, entriesForDay, hydrationProgress, setWaterGoal, totalForDay, undoLastWater, ValidationError } from './hydration';
import { dataWith, water } from '../../test/fixtures';
import { buildActivityIndex } from '../streak/streak';

describe('hidratação', () => {
  it('registra água no dia de Recife e guarda a meta vigente', () => {
    const now = new Date('2026-05-02T01:00:00Z'); // 22:00 do dia 01 em Recife
    const { data, entry } = addWater(dataWith(), 500, now);
    expect(entry.dateKey).toBe('2026-05-01');
    expect(entry.goalMl).toBe(3300);
    expect(totalForDay(data, '2026-05-01')).toBe(500);
  });

  it('rejeita quantidades inválidas', () => {
    expect(() => addWater(dataWith(), 0)).toThrow(ValidationError);
    expect(() => addWater(dataWith(), -10)).toThrow(ValidationError);
    expect(() => addWater(dataWith(), 1.5)).toThrow(ValidationError);
    expect(() => addWater(dataWith(), 50000)).toThrow(ValidationError);
  });

  it('desfaz apenas o último registro do dia', () => {
    let d = dataWith();
    d = addWater(d, 250, new Date('2026-05-01T12:00:00Z')).data;
    d = addWater(d, 750, new Date('2026-05-01T13:00:00Z')).data;
    const r = undoLastWater(d, '2026-05-01')!;
    expect(r.removed.amountMl).toBe(750);
    expect(totalForDay(r.data, '2026-05-01')).toBe(250);
    expect(r.data.counters.waterUndos).toBe(1);
    expect(undoLastWater(dataWith(), '2026-05-01')).toBeNull();
  });

  it('progresso sem compensação de dias anteriores', () => {
    const d = dataWith({ waterEntries: [water('2026-05-01', 3000), water('2026-05-02', 1000)] });
    expect(totalForDay(d, '2026-05-02')).toBe(1000);
    const p = hydrationProgress(1000, 3300);
    expect(p.remaining).toBe(2300);
    expect(p.percent).toBe(30);
    expect(hydrationProgress(4000, 3300).percent).toBe(100);
  });

  it('alterar a meta afeta o dia atual, mas preserva a meta histórica', () => {
    const d = dataWith({ waterEntries: [water('2026-05-01', 2500), water('2026-05-02', 2500)] });
    const updated = setWaterGoal(d, 2500, '2026-05-02');
    const idx = buildActivityIndex(updated);
    expect(updated.settings.waterGoalMl).toBe(2500);
    expect(idx.get('2026-05-01')!.goalMet).toBe(false);
    expect(idx.get('2026-05-02')!.goalMet).toBe(true);
    expect(() => setWaterGoal(d, 100)).toThrow();
  });

  it('lista registros do dia em ordem', () => {
    const d = dataWith({ waterEntries: [water('2026-05-01', 500, 3300, 15), water('2026-05-01', 250, 3300, 9)] });
    expect(entriesForDay(d, '2026-05-01').map((w) => w.amountMl)).toEqual([250, 500]);
  });
});
