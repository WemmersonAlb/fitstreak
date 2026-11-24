import { describe, it, expect } from 'vitest';
import { addFreeMeal, addMealLog, describeMealLog, freeMealsInWeek, removeMealLog, slotStatuses } from './meals';
import { dataWith, freeMeal } from '../../test/fixtures';
import { MEAL_CATEGORIES } from '../../data/nutrition/plan';

describe('registro de refeições', () => {
  it('registra a opção principal com os alimentos do plano', () => {
    const { data, log } = addMealLog(dataWith(), { dateKey: '2026-05-01', categoryId: 'cafe', kind: 'main', time: '07:30' });
    expect(log.slot).toBe('cafe');
    expect(log.choices.map((c) => c.food)).toEqual([
      'Ovo de galinha cozido',
      'Cuscuz de milho cozido',
      'Requeijão light',
    ]);
    expect(data.mealLogs).toHaveLength(1);
  });

  it('preserva substituições escolhidas', () => {
    const { log } = addMealLog(dataWith(), {
      dateKey: '2026-05-01',
      categoryId: 'almoco_feijao',
      kind: 'custom-plan',
      time: '12:10',
      choices: [{ groupId: 'proteina', groupLabel: 'Proteína', food: 'Patinho moído refogado', source: 'substitution' }],
      notes: 'Com salada',
    });
    expect(describeMealLog(log)).toBe('Patinho moído refogado');
    expect(log.notes).toBe('Com salada');
  });

  it('registra sugestão de preparo pelo id', () => {
    const { log } = addMealLog(dataWith(), {
      dateKey: '2026-05-01',
      categoryId: 'cafe',
      kind: 'suggestion',
      suggestionId: 'cafe-03',
      time: '08:00',
    });
    expect(log.suggestionTitle).toBe('Tapiovo');
    expect(() =>
      addMealLog(dataWith(), { dateKey: '2026-05-01', categoryId: 'ceia', kind: 'suggestion', suggestionId: 'cafe-03', time: '22:00' }),
    ).toThrow();
  });

  it('valida data, horário e descrição', () => {
    expect(() => addMealLog(dataWith(), { dateKey: '2026-02-30', categoryId: 'cafe', kind: 'main', time: '07:00' })).toThrow();
    expect(() => addMealLog(dataWith(), { dateKey: '2026-02-03', categoryId: 'cafe', kind: 'main', time: '25:00' })).toThrow();
    expect(() =>
      addMealLog(dataWith(), { dateKey: '2026-02-03', categoryId: 'cafe', kind: 'other', otherDescription: '  ', time: '07:00' }),
    ).toThrow();
  });

  it('status por momento do dia (refeição, livre, pendente)', () => {
    let d = addMealLog(dataWith(), { dateKey: '2026-05-01', categoryId: 'cafe_raiz', kind: 'main', time: '07:00' }).data;
    d = addFreeMeal(d, { dateKey: '2026-05-01', description: 'Hambúrguer', slot: 'jantar', time: '20:00' }).data;
    const st = Object.fromEntries(slotStatuses(d, '2026-05-01').map((s) => [s.slot.id, s.state]));
    expect(st).toEqual({ cafe: 'done', almoco: 'pending', lanche: 'pending', jantar: 'free', ceia: 'pending' });
    const removed = removeMealLog(d, d.mealLogs[0].id);
    expect(removed.mealLogs).toHaveLength(0);
  });
});

describe('refeições livres', () => {
  it('conta refeições livres na semana (segunda a domingo)', () => {
    const d = dataWith({
      freeMeals: [freeMeal('2026-11-22'), freeMeal('2026-11-23'), freeMeal('2026-11-29'), freeMeal('2026-11-30')],
    });
    expect(freeMealsInWeek(d, '2026-11-25')).toHaveLength(2);
  });

  it('exige descrição', () => {
    expect(() => addFreeMeal(dataWith(), { dateKey: '2026-05-01', description: '', time: '20:00' })).toThrow();
  });
});

describe('plano alimentar', () => {
  it('tem as 8 categorias independentes do PDF', () => {
    expect(MEAL_CATEGORIES.map((c) => c.id)).toEqual([
      'cafe_raiz', 'cafe', 'almoco_feijao', 'almoco', 'lanche', 'jantar', 'jantar_raiz', 'ceia',
    ]);
  });
});
