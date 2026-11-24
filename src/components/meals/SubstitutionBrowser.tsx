import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { SUBSTITUTION_GROUPS } from '../../data/nutrition/substitutions';
import { normalizeText } from '../../utils/format';
import { EmptyState } from '../common/ui';
import { SubstitutionGroupModal, SubstitutionItems } from './SubstitutionGroupModal';

export function SubstitutionBrowser() {
  const [query, setQuery] = useState('');
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const [modalGroup, setModalGroup] = useState<number | null>(null);
  const q = normalizeText(query);

  const results = useMemo(() => {
    if (!q) return [];
    return SUBSTITUTION_GROUPS.flatMap((g) =>
      g.items.filter((it) => normalizeText(it.food).includes(q)).map((it) => ({ group: g, item: it })),
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <label htmlFor="sub-search" className="sr-only">
          Buscar alimento na lista de substituição
        </label>
        <input
          id="sub-search"
          type="search"
          className="input pl-11 pr-11"
          placeholder="Buscar alimento (ex.: batata inglesa)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg"
            onClick={() => setQuery('')}
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {q ? (
        results.length ? (
          <ul className="space-y-2" aria-live="polite">
            {results.map(({ group, item }) => (
              <li key={`${group.number}-${item.food}-${item.measure}`} className="rounded-2xl border border-line/70 bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.food}</p>
                    <p className="text-sm text-muted">
                      1 porção = {item.measure.replace(/(\d)\.(\d)/g, '$1,$2')} ({String(item.amount).replace('.', ',')}
                      {item.unit})
                    </p>
                  </div>
                  <button className="chip shrink-0 hover:text-fg" onClick={() => setModalGroup(group.number)}>
                    Grupo {group.number}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">{group.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState emoji="🔎" title="Nada encontrado" description="Esse alimento não está na lista de substituição da nutricionista." />
        )
      ) : (
        <div className="space-y-2">
          {SUBSTITUTION_GROUPS.map((g) => {
            const open = openGroup === g.number;
            return (
              <div key={g.number} className="overflow-hidden rounded-2xl border border-line/70 bg-surface">
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setOpenGroup(open ? null : g.number)}
                  aria-expanded={open}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                    {g.number}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">{g.name}</span>
                    <span className="text-xs text-muted">{g.items.length} alimentos</span>
                  </span>
                </button>
                {open && (
                  <div className="animate-fade-up border-t border-line/70 px-4 pb-2">
                    <SubstitutionItems items={g.items} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <SubstitutionGroupModal group={modalGroup} onClose={() => setModalGroup(null)} />
    </div>
  );
}
