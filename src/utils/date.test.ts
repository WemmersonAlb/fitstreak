import { describe, it, expect } from 'vitest';
import { addDays, diffDays, isValidDateKey, startOfWeek, toDateKey, toTimeHM, weekday, hourInAppZone } from './date';

describe('datas no fuso America/Recife', () => {
  it('converte instantes UTC para o dia local de Recife (UTC-3)', () => {
    // 02:30Z do dia 15 ainda é dia 14 em Recife
    expect(toDateKey(new Date('2026-03-15T02:30:00Z'))).toBe('2026-03-14');
    expect(toDateKey(new Date('2026-03-15T03:00:00Z'))).toBe('2026-03-15');
    expect(toTimeHM(new Date('2026-03-15T02:30:00Z'))).toBe('23:30');
    expect(hourInAppZone(new Date('2026-03-15T02:30:00Z'))).toBe(23);
  });

  it('virada de ano em Recife', () => {
    expect(toDateKey(new Date('2027-01-01T02:59:59Z'))).toBe('2026-12-31');
    expect(toDateKey(new Date('2027-01-01T03:00:00Z'))).toBe('2027-01-01');
  });

  it('aritmética de dias atravessa mês, ano e fevereiro bissexto', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('não é afetado por horário de verão de outros fusos', () => {
    // Datas de mudança de horário nos EUA/Europa não alteram a contagem de dias.
    expect(diffDays('2026-03-07', '2026-03-09')).toBe(2);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('valida chaves de data', () => {
    expect(isValidDateKey('2026-02-29')).toBe(false);
    expect(isValidDateKey('2028-02-29')).toBe(true);
    expect(isValidDateKey('2026-13-01')).toBe(false);
    expect(isValidDateKey('20260101')).toBe(false);
  });

  it('semana começa na segunda-feira', () => {
    expect(weekday('2026-11-23')).toBe(1); // segunda
    expect(startOfWeek('2026-11-29')).toBe('2026-11-23'); // domingo
    expect(startOfWeek('2026-11-23')).toBe('2026-11-23');
  });
});
