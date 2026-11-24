import { describe, it, expect } from 'vitest';
import { evaluateAchievements } from './engine';
import { dataWith, days, freeMeal, meal, water } from '../../test/fixtures';

const NOW = new Date('2026-06-01T12:00:00Z');

describe('conquistas', () => {
  it('desbloqueia automaticamente e registra a data', () => {
    const data = dataWith({ mealLogs: [meal('2026-05-01')] });
    const r = evaluateAchievements(data, '2026-05-01', NOW);
    const ids = r.unlocked.map((a) => a.id);
    expect(ids).toContain('streak-1');
    expect(ids).toContain('meal-1');
    expect(r.data.achievements['streak-1'].unlockedAt).toBe(NOW.toISOString());
  });

  it('conquistas especiais de 13, 42 e 67 dias', () => {
    const mealLogs = days('2026-01-01', 67).map((k) => meal(k));
    const r = evaluateAchievements(dataWith({ mealLogs }), '2026-03-08', NOW);
    const ids = r.unlocked.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['streak-13', 'streak-42', 'streak-67', 'secret-thanos']));
    expect(ids).not.toContain('streak-75');
    expect(r.data.records.bestStreak).toBe(67);
    expect(r.unlocked.find((a) => a.id === 'streak-67')!.celebration).toBe('six-seven');
  });

  it('nunca remove conquistas nem reduz recorde', () => {
    const data = dataWith({
      achievements: { 'streak-30': { unlockedAt: '2026-01-01T00:00:00.000Z' } },
      records: { bestStreak: 30 },
      mealLogs: [meal('2026-05-01')],
    });
    const r = evaluateAchievements(data, '2026-05-10', NOW);
    expect(r.data.achievements['streak-30']).toBeDefined();
    expect(r.data.records.bestStreak).toBe(30);
  });

  it('não desbloqueia de novo nem altera a data original', () => {
    const data = dataWith({ mealLogs: [meal('2026-05-01')] });
    const first = evaluateAchievements(data, '2026-05-01', NOW);
    const second = evaluateAchievements(first.data, '2026-05-01', new Date('2026-07-01T00:00:00Z'));
    expect(second.unlocked).toHaveLength(0);
    expect(second.data).toBe(first.data);
  });

  it('hidratação: primeiro litro, meta e acumulados', () => {
    const waterEntries = days('2026-05-01', 7).map((k) => water(k, 3300));
    const r = evaluateAchievements(dataWith({ waterEntries }), '2026-05-07', NOW);
    const ids = r.unlocked.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['water-1l', 'water-goal-1', 'water-goal-7', 'water-10l', 'secret-9000']));
    expect(ids).not.toContain('water-50l');
  });

  it('refeição livre e "Água, por favor"', () => {
    const r = evaluateAchievements(
      dataWith({ freeMeals: [freeMeal('2026-05-01'), freeMeal('2026-05-02')], waterEntries: [water('2026-05-01', 3300)] }),
      '2026-05-02',
      NOW,
    );
    const ids = r.unlocked.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['free-1', 'secret-vontade', 'secret-agua-por-favor']));
  });

  it('"O importante é participar" após perder a ofensiva', () => {
    const r = evaluateAchievements(dataWith({ mealLogs: [meal('2026-05-01'), meal('2026-05-03')] }), '2026-05-03', NOW);
    expect(r.unlocked.map((a) => a.id)).toContain('secret-participar');
  });

  it('ofensiva atravessando o ano novo', () => {
    const r = evaluateAchievements(dataWith({ mealLogs: [meal('2026-12-31'), meal('2027-01-01')] }), '2027-01-01', NOW);
    expect(r.unlocked.map((a) => a.id)).toContain('secret-ano-novo');
  });

  it('semana planejada completa com até 2 refeições livres', () => {
    const mealLogs = days('2026-11-23', 7).map((k) => meal(k));
    const r = evaluateAchievements(dataWith({ mealLogs, freeMeals: [freeMeal('2026-11-25')] }), '2026-11-30', NOW);
    expect(r.unlocked.map((a) => a.id)).toContain('planned-week');
    const partial = evaluateAchievements(dataWith({ mealLogs: mealLogs.slice(0, 6) }), '2026-11-30', NOW);
    expect(partial.unlocked.map((a) => a.id)).not.toContain('planned-week');
  });

  it('dia completo com todos os momentos', () => {
    const k = '2026-05-01';
    const mealLogs = [
      meal(k, { slot: 'cafe', categoryId: 'cafe' }),
      meal(k, { slot: 'almoco', categoryId: 'almoco' }),
      meal(k, { slot: 'lanche', categoryId: 'lanche' }),
      meal(k, { slot: 'jantar', categoryId: 'jantar' }),
    ];
    const r1 = evaluateAchievements(dataWith({ mealLogs }), k, NOW);
    expect(r1.unlocked.map((a) => a.id)).not.toContain('meal-full-day');
    const r2 = evaluateAchievements(dataWith({ mealLogs, freeMeals: [freeMeal(k, { slot: 'ceia' })] }), k, NOW);
    expect(r2.unlocked.map((a) => a.id)).toContain('meal-full-day');
  });
});
