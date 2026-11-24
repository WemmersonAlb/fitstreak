import { describe, it, expect } from 'vitest';
import { MemoryStore, StorageRepository } from './repository';
import { validateAppData } from './schema';
import { STORAGE_KEY } from '../../constants';
import { dataWith, meal, water } from '../../test/fixtures';

describe('repositório de armazenamento', () => {
  it('inicia vazio sem dados salvos', () => {
    const r = new StorageRepository(new MemoryStore()).load();
    expect(r.status).toBe('fresh');
    expect(r.data.settings.waterGoalMl).toBe(3300);
  });

  it('persiste e recarrega (simula atualizar a página)', () => {
    const store = new MemoryStore();
    const data = dataWith({ waterEntries: [water('2026-05-01')], mealLogs: [meal('2026-05-01')] });
    new StorageRepository(store).save(data);
    const reloaded = new StorageRepository(store).load();
    expect(reloaded.status).toBe('loaded');
    expect(reloaded.data).toEqual(data);
  });

  it('isola JSON corrompido e preserva uma cópia', () => {
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, '{quebrado');
    const r = new StorageRepository(store).load();
    expect(r.status).toBe('corrupted');
    expect(r.data.mealLogs).toEqual([]);
    const keys = Array.from({ length: store.length }, (_, i) => store.key(i));
    expect(keys.some((k) => k?.startsWith('fitstreak:corrupted:'))).toBe(true);
  });

  it('recupera parcialmente dados com itens inválidos e guarda backup do original', () => {
    const store = new MemoryStore();
    const raw = { ...dataWith(), mealLogs: [meal('2026-05-01'), { lixo: true }] };
    store.setItem(STORAGE_KEY, JSON.stringify(raw));
    const repo = new StorageRepository(store);
    const r = repo.load();
    expect(r.status).toBe('recovered');
    expect(r.data.mealLogs).toHaveLength(1);
    expect(repo.listBackups()).toHaveLength(1);
  });

  it('mantém no máximo 3 backups automáticos', () => {
    const store = new MemoryStore();
    const repo = new StorageRepository(store);
    repo.save(dataWith());
    for (let i = 0; i < 5; i++) repo.backupCurrent(`b${i}`);
    expect(repo.listBackups().length).toBeLessThanOrEqual(3);
  });
});

describe('migração de esquema', () => {
  it('migra dados sem versão (v0) preenchendo padrões', () => {
    const { data } = validateAppData({ waterEntries: [water('2026-05-01')] });
    expect(data.schemaVersion).toBe(1);
    expect(data.settings.waterGoalMl).toBe(3300);
    expect(data.waterEntries).toHaveLength(1);
    expect(data.records.bestStreak).toBe(0);
  });

  it('rejeita versões futuras', () => {
    expect(() => validateAppData({ schemaVersion: 5 })).toThrow(/mais nova/);
  });

  it('corrige configurações inválidas', () => {
    const { data, report } = validateAppData({ schemaVersion: 1, settings: { theme: 'neon', waterGoalMl: -1, mealTimes: { cafe: '07:00', almoco: '99:99' } } });
    expect(data.settings.theme).toBe('dark');
    expect(data.settings.waterGoalMl).toBe(3300);
    expect(data.settings.mealTimes.cafe).toBe('07:00');
    expect(data.settings.mealTimes.almoco).toBe('');
    expect(report.warnings).toHaveLength(0);
  });
});
