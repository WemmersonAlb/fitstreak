import { describe, it, expect } from 'vitest';
import { buildActivityIndex, computeStreak, nextMilestone, streakSeries, trackedDayKeys } from './streak';
import { dataWith, days, freeMeal, meal, water } from '../../test/fixtures';

const keysOf = (d: ReturnType<typeof dataWith>) => trackedDayKeys(buildActivityIndex(d));

describe('dia acompanhado', () => {
  it('considera refeição, água ou refeição livre como atividade e explica o motivo', () => {
    const data = dataWith({
      mealLogs: [meal('2026-05-01')],
      waterEntries: [water('2026-05-02')],
      freeMeals: [freeMeal('2026-05-03')],
    });
    const idx = buildActivityIndex(data);
    expect(keysOf(data)).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
    expect(idx.get('2026-05-03')!.reasons.join()).toMatch(/Refeição livre/);
    expect(idx.get('2026-05-02')!.reasons.join()).toMatch(/água/);
  });

  it('meta de água é independente do acompanhamento', () => {
    const data = dataWith({ waterEntries: [water('2026-05-01', 1000), water('2026-05-02', 3300)] });
    const idx = buildActivityIndex(data);
    expect(idx.get('2026-05-01')!.tracked).toBe(true);
    expect(idx.get('2026-05-01')!.goalMet).toBe(false);
    expect(idx.get('2026-05-02')!.goalMet).toBe(true);
  });
});

describe('cálculo da ofensiva', () => {
  it('conta dias consecutivos até hoje', () => {
    const s = computeStreak(days('2026-05-01', 5), '2026-05-05');
    expect(s.current).toBe(5);
    expect(s.todayTracked).toBe(true);
    expect(s.atRisk).toBe(false);
  });

  it('mantém a ofensiva viva se o último registro foi ontem (em risco)', () => {
    const s = computeStreak(days('2026-05-01', 5), '2026-05-06');
    expect(s.current).toBe(5);
    expect(s.atRisk).toBe(true);
  });

  it('um dia sem registros interrompe a sequência', () => {
    const s = computeStreak(days('2026-05-01', 5), '2026-05-07');
    expect(s.current).toBe(0);
    expect(s.best).toBe(5);
  });

  it('preserva o recorde histórico', () => {
    const keys = [...days('2026-04-01', 10), ...days('2026-05-01', 3)];
    const s = computeStreak(keys, '2026-05-03');
    expect(s.current).toBe(3);
    expect(s.best).toBe(10);
    expect(s.runs).toHaveLength(2);
    expect(computeStreak(days('2026-05-01', 2), '2026-05-02', 40).best).toBe(40);
  });

  it('atravessa virada de mês e de ano', () => {
    expect(computeStreak(days('2026-01-30', 4), '2026-02-02').current).toBe(4);
    expect(computeStreak(days('2026-12-30', 4), '2027-01-02').current).toBe(4);
    expect(computeStreak(days('2028-02-27', 4), '2028-03-01').current).toBe(4);
  });

  it('refeição livre não quebra a ofensiva', () => {
    const data = dataWith({
      mealLogs: [meal('2026-05-01'), meal('2026-05-03')],
      freeMeals: [freeMeal('2026-05-02')],
    });
    expect(computeStreak(keysOf(data), '2026-05-03').current).toBe(3);
  });

  it('ignora registros com data futura', () => {
    const s = computeStreak(['2026-05-01', '2026-05-02', '2026-06-10'], '2026-05-02');
    expect(s.current).toBe(2);
  });

  it('próximo marco', () => {
    expect(nextMilestone(0)).toBe(1);
    expect(nextMilestone(7)).toBe(13);
    expect(nextMilestone(66)).toBe(67);
    expect(nextMilestone(365)).toBeNull();
  });

  it('série diária considera dias anteriores ao intervalo', () => {
    const series = streakSeries(days('2026-05-01', 5), '2026-05-04', '2026-05-06');
    expect(series.map((p) => p.streak)).toEqual([4, 5, 0]);
  });
});
