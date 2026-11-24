const nf = new Intl.NumberFormat('pt-BR');
const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatMl(ml: number): string {
  return `${nf.format(Math.round(ml))} ml`;
}

export function formatLiters(ml: number): string {
  return `${nf1.format(ml / 1000)} L`;
}

export function formatNumber(n: number): string {
  return nf1.format(n);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function plural(n: number, one: string, many: string): string {
  return `${nf.format(n)} ${n === 1 ? one : many}`;
}

/** Remove acentos e caixa para busca. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function formatPortion(measure: string, amount: number, unit: string): string {
  if (amount === 0) return 'à vontade';
  return `${measure.replace(/(\d)\.(\d)/g, '$1,$2')} (${nf1.format(amount)}${unit})`;
}

export function newId(prefix = ''): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${rnd}` : rnd;
}
