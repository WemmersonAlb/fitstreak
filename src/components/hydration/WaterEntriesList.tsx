import { Trash2 } from 'lucide-react';
import type { WaterEntry } from '../../types';
import { formatMl } from '../../utils/format';
import { toTimeHM } from '../../utils/date';

export function WaterEntriesList({ entries, onRemove }: { entries: WaterEntry[]; onRemove?: (id: string) => void }) {
  if (!entries.length) {
    return <p className="py-4 text-center text-sm text-muted">Nenhum registro de água ainda.</p>;
  }
  return (
    <ul className="divide-y divide-line/70">
      {[...entries].reverse().map((w) => (
        <li key={w.id} className="flex items-center gap-3 py-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-water/10 text-base" aria-hidden>
            💧
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold tabular-nums">{formatMl(w.amountMl)}</p>
            <p className="text-xs text-muted">{toTimeHM(new Date(w.createdAt))}</p>
          </div>
          {onRemove && (
            <button className="btn-ghost p-2" onClick={() => onRemove(w.id)} aria-label={`Remover registro de ${formatMl(w.amountMl)}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
