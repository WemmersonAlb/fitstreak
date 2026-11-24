import { useState } from 'react';
import { ChevronDown, Info, NotebookPen, Sparkles } from 'lucide-react';
import type { MealCategory, MealGroup, PreparationSuggestion } from '../../types';
import { formatPortion } from '../../utils/format';
import { getSubstitutionGroup } from '../../data/nutrition/substitutions';

export function portionText(g: MealGroup['main']) {
  return formatPortion(g.measure, g.amount, g.unit);
}

function GroupRefLink({ group, portions, onOpenGroup }: { group: number; portions: number; onOpenGroup?: (n: number) => void }) {
  const g = getSubstitutionGroup(group);
  const text = `Ou escolha ${String(portions).replace('.', ',')} ${portions === 1 || portions < 1 ? 'porção' : 'porções'} do grupo ${group}${g ? ` (${g.name})` : ''}`;
  if (!onOpenGroup) return <p className="text-xs text-muted">{text}</p>;
  return (
    <button className="text-left text-xs font-medium text-accent hover:underline" onClick={() => onOpenGroup(group)}>
      {text} →
    </button>
  );
}

export function MealGroupsList({ category, onOpenGroup }: { category: MealCategory; onOpenGroup?: (n: number) => void }) {
  return (
    <div className="space-y-3">
      {category.groups.map((g) => (
        <div key={g.id} className="rounded-2xl bg-surface-2 p-4">
          <p className="eyebrow mb-2">{g.label}</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{g.main.food}</p>
              <p className="text-sm text-muted">{portionText(g.main)}</p>
            </div>
            <span className="chip shrink-0 border-accent/30 bg-accent/10 text-accent">Principal</span>
          </div>
          {g.substitutions.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-line/70 pt-3">
              {g.substitutions.map((s) => (
                <li key={s.food} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{s.food}</span>
                  <span className="shrink-0 text-right text-xs text-muted">{portionText(s)}</span>
                </li>
              ))}
            </ul>
          )}
          {g.groupRef && (
            <div className="mt-2.5">
              <GroupRefLink {...g.groupRef} onOpenGroup={onOpenGroup} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SuggestionCard({ suggestion, defaultOpen = false }: { suggestion: PreparationSuggestion; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-surface">
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent/10 text-xs font-bold text-accent">
          {suggestion.number}
        </span>
        <span className="flex-1 font-semibold">{suggestion.title}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <p className="animate-fade-up px-4 pb-4 text-sm leading-relaxed text-muted">{suggestion.description}</p>}
    </div>
  );
}

export function CategoryDetails({ category, onOpenGroup }: { category: MealCategory; onOpenGroup?: (n: number) => void }) {
  return (
    <div className="space-y-5">
      <MealGroupsList category={category} onOpenGroup={onOpenGroup} />

      {category.notes.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold">
            <NotebookPen className="h-4 w-4 text-accent" /> Observações da nutricionista
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted">
            {category.notes.map((n, i) => (
              <li key={i} className="rounded-2xl bg-accent/5 px-4 py-2.5">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {category.suggestions.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-accent" /> Sugestões de preparo
          </p>
          <div className="space-y-2">
            {category.suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </div>
      )}

      {category.reviewNotes && category.reviewNotes.length > 0 && (
        <details className="rounded-2xl border border-warn/30 bg-warn/5 px-4 py-3 text-xs text-muted">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold text-fg">
            <Info className="h-4 w-4 text-warn" /> Pontos para revisar com a nutricionista
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {category.reviewNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
