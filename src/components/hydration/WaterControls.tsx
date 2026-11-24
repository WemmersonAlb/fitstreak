import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { QUICK_WATER_AMOUNTS, MAX_WATER_ENTRY_ML } from '../../constants';
import { useWaterActions } from '../../hooks/useWaterActions';

function label(ml: number) {
  return ml >= 1000 ? `+${(ml / 1000).toLocaleString('pt-BR')} L` : `+${ml}`;
}

export function QuickAddButtons({ compact = false }: { compact?: boolean }) {
  const { add } = useWaterActions();
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-5' : 'grid-cols-3 sm:grid-cols-5'}`}>
      {QUICK_WATER_AMOUNTS.map((ml) => (
        <button
          key={ml}
          className="btn rounded-2xl bg-water/10 px-2 py-3 text-water hover:bg-water/20"
          onClick={() => add(ml)}
          aria-label={`Adicionar ${ml} ml de água`}
        >
          <span className="tabular-nums">{label(ml)}</span>
          {!compact && ml < 1000 && <span className="-ml-1 text-xs font-medium opacity-70">ml</span>}
        </button>
      ))}
    </div>
  );
}

export function CustomAmountForm({ onDone }: { onDone?: () => void }) {
  const { add } = useWaterActions();
  const [value, setValue] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (add(n)) {
      setValue('');
      onDone?.();
    }
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <label className="sr-only" htmlFor="custom-water">
        Quantidade personalizada em ml
      </label>
      <div className="relative flex-1">
        <input
          id="custom-water"
          className="input pr-12"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_WATER_ENTRY_ML}
          step={1}
          placeholder="Outra quantidade"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">ml</span>
      </div>
      <button className="btn-water" type="submit" disabled={!value}>
        <Plus className="h-4 w-4" /> Adicionar
      </button>
    </form>
  );
}
