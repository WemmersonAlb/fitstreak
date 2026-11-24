import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Plus, Lightbulb } from 'lucide-react';
import type { MealCategoryId } from '../../types';
import { GENERAL_GUIDELINES, MEAL_CATEGORIES, MEAL_SLOTS, NUTRITIONIST, RECIPES } from '../../data/nutrition/plan';
import { PageHeader, Segmented } from '../../components/common/ui';
import { MealSlotList } from '../../components/meals/MealSlotList';
import { CategoryDetails, SuggestionCard } from '../../components/meals/CategoryDetails';
import { MealLogSheet } from '../../components/meals/MealLogSheet';
import { SubstitutionBrowser } from '../../components/meals/SubstitutionBrowser';
import { SubstitutionGroupModal } from '../../components/meals/SubstitutionGroupModal';
import { FreeMealsPanel } from '../../components/meals/FreeMealsPanel';

type Tab = 'hoje' | 'cardapio' | 'substituicoes' | 'preparos' | 'livres';
const TABS: { value: Tab; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'cardapio', label: 'Cardápio' },
  { value: 'substituicoes', label: 'Substituições' },
  { value: 'preparos', label: 'Preparos' },
  { value: 'livres', label: 'Livres' },
];

function MenuTab() {
  const [open, setOpen] = useState<MealCategoryId | null>(null);
  const [logCat, setLogCat] = useState<MealCategoryId | null>(null);
  const [group, setGroup] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {MEAL_CATEGORIES.map((c) => {
        const isOpen = open === c.id;
        const slot = MEAL_SLOTS.find((s) => s.id === c.slot)!;
        return (
          <section key={c.id} className="overflow-hidden rounded-3xl border border-line/70 bg-surface">
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={() => setOpen(isOpen ? null : c.id)}
              aria-expanded={isOpen}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-xl" aria-hidden>
                {slot.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{c.name}</span>
                <span className="block truncate text-xs text-muted">
                  {c.groups.filter((g) => !g.freeQuantity).map((g) => g.main.food).join(' · ')}
                </span>
              </span>
              <ChevronDown className={`h-5 w-5 text-muted transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {isOpen && (
              <div className="animate-fade-up border-t border-line/70 p-4">
                <CategoryDetails category={c} onOpenGroup={setGroup} />
                <button className="btn-primary mt-4 w-full" onClick={() => setLogCat(c.id)}>
                  <Plus className="h-4 w-4" /> Registrar {c.name.toLowerCase()}
                </button>
              </div>
            )}
          </section>
        );
      })}
      <MealLogSheet open={!!logCat} onClose={() => setLogCat(null)} categoryId={logCat ?? undefined} slot={logCat ? MEAL_CATEGORIES.find((c) => c.id === logCat)!.slot : undefined} />
      <SubstitutionGroupModal group={group} onClose={() => setGroup(null)} />
    </div>
  );
}

function PreparationsTab() {
  const withSuggestions = MEAL_CATEGORIES.filter((c) => c.suggestions.length);
  return (
    <div className="space-y-6">
      {withSuggestions.map((c) => (
        <section key={c.id}>
          <h3 className="mb-2 text-sm font-bold">{c.name}</h3>
          <div className="space-y-2">
            {c.suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </section>
      ))}
      <section>
        <h3 className="mb-2 text-sm font-bold">Receitas</h3>
        {RECIPES.map((r) => (
          <details key={r.id} className="group rounded-2xl border border-line/70 bg-surface px-4 py-3">
            <summary className="cursor-pointer list-none font-semibold">
              🥗 {r.title}
              {r.author && <span className="block text-xs font-normal text-muted">{r.author} · Rendimento: {r.servings}</span>}
            </summary>
            <div className="mt-3 text-sm">
              <p className="label">Ingredientes</p>
              <ul className="mb-3 list-disc space-y-1 pl-5 text-muted">
                {r.ingredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p className="label">Modo de preparo</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted">
                {r.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

export default function NutritionPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.value === params.get('aba'))?.value ?? 'hoje') as Tab;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Alimentação" subtitle={`Plano alimentar · ${NUTRITIONIST.name} (${NUTRITIONIST.crn})`} />
      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-bg/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <Segmented label="Seções da alimentação" value={tab} onChange={(v) => setParams({ aba: v }, { replace: true })} options={TABS} />
      </div>

      {tab === 'hoje' && (
        <div className="space-y-4">
          <MealSlotList />
          <section className="card">
            <p className="mb-2 flex items-center gap-2 font-bold">
              <Lightbulb className="h-4 w-4 text-warn" /> Orientações gerais
            </p>
            <ul className="space-y-1.5 text-sm text-muted">
              {GENERAL_GUIDELINES.map((g) => (
                <li key={g} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {tab === 'cardapio' && <MenuTab />}
      {tab === 'substituicoes' && <SubstitutionBrowser />}
      {tab === 'preparos' && <PreparationsTab />}
      {tab === 'livres' && <FreeMealsPanel />}
    </div>
  );
}
