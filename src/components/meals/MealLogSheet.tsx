import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { MealCategoryId, MealChoice, MealSelectionKind, MealSlotId } from '../../types';
import { MEAL_CATEGORIES, MEAL_SLOTS, getCategory } from '../../data/nutrition/plan';
import { getSubstitutionGroup } from '../../data/nutrition/substitutions';
import { useAppData } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import { ValidationError } from '../../services/hydration/hydration';
import { toTimeHM } from '../../utils/date';
import { Modal } from '../common/Modal';
import { portionText } from './CategoryDetails';

type GroupPick = { type: 'main' } | { type: 'sub'; index: number } | { type: 'group'; food: string } | { type: 'skip' };

const MODES: { value: MealSelectionKind; label: string; hint: string }[] = [
  { value: 'main', label: 'Opção principal', hint: 'Comi exatamente a opção principal' },
  { value: 'custom-plan', label: 'Com substituições', hint: 'Troquei um ou mais itens' },
  { value: 'suggestion', label: 'Sugestão de preparo', hint: 'Fiz uma receita sugerida' },
  { value: 'other', label: 'Outra coisa', hint: 'Descrever livremente' },
];

export function MealLogSheet({
  open,
  onClose,
  slot,
  categoryId,
  dateKey,
}: {
  open: boolean;
  onClose: () => void;
  slot?: MealSlotId;
  categoryId?: MealCategoryId;
  dateKey?: string;
}) {
  const { addMeal, today } = useAppData();
  const toast = useToast();

  const allowed = useMemo(() => {
    const s = slot ? MEAL_SLOTS.find((x) => x.id === slot) : undefined;
    return s ? MEAL_CATEGORIES.filter((c) => s.categories.includes(c.id)) : MEAL_CATEGORIES;
  }, [slot]);

  const [catId, setCatId] = useState<MealCategoryId>(categoryId ?? allowed[0].id);
  const [mode, setMode] = useState<MealSelectionKind>('main');
  const [picks, setPicks] = useState<Record<string, GroupPick>>({});
  const [suggestionId, setSuggestionId] = useState('');
  const [other, setOther] = useState('');
  const [time, setTime] = useState(toTimeHM());
  const [date, setDate] = useState(dateKey ?? today);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCatId(categoryId ?? allowed[0].id);
    setMode('main');
    setPicks({});
    setSuggestionId('');
    setOther('');
    setTime(toTimeHM());
    setDate(dateKey ?? today);
    setNotes('');
    setError('');
  }, [open, categoryId, allowed, dateKey, today]);

  const category = getCategory(catId)!;
  const modes = MODES.filter((m) => m.value !== 'suggestion' || category.suggestions.length > 0);

  const buildChoices = (): MealChoice[] =>
    category.groups.flatMap((g): MealChoice[] => {
      const pick = picks[g.id] ?? { type: 'main' };
      if (pick.type === 'skip') return [];
      if (pick.type === 'sub') {
        const s = g.substitutions[pick.index];
        return [{ groupId: g.id, groupLabel: g.label, food: s.food, source: 'substitution' }];
      }
      if (pick.type === 'group') {
        const ref = g.groupRef!;
        return [
          {
            groupId: g.id,
            groupLabel: g.label,
            food: `${pick.food} — ${String(ref.portions).replace('.', ',')} porção(ões) do grupo ${ref.group}`,
            source: 'group',
          },
        ];
      }
      return [{ groupId: g.id, groupLabel: g.label, food: g.main.food, source: 'main' }];
    });

  const submit = () => {
    setError('');
    if (date > today) {
      setError('Não é possível registrar refeições em datas futuras.');
      return;
    }
    try {
      addMeal({
        dateKey: date,
        categoryId: catId,
        kind: mode,
        choices: mode === 'custom-plan' ? buildChoices() : undefined,
        suggestionId: mode === 'suggestion' ? suggestionId : undefined,
        otherDescription: mode === 'other' ? other : undefined,
        time,
        notes,
      });
      toast.show(`${category.name} registrado! 🍽️`);
      onClose();
    } catch (e) {
      setError(e instanceof ValidationError ? e.message : 'Não foi possível registrar a refeição.');
    }
  };

  const setPick = (groupId: string, pick: GroupPick) => setPicks((p) => ({ ...p, [groupId]: pick }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar refeição"
      subtitle={date === today ? 'Hoje' : date.split('-').reverse().join('/')}
      size="lg"
      footer={
        <div className="flex items-center gap-3">
          {error && (
            <p className="flex-1 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <button className="btn-primary ml-auto px-6" onClick={submit}>
            <Check className="h-4 w-4" /> Registrar
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {allowed.length > 1 && (
          <fieldset>
            <legend className="label">Refeição</legend>
            <div className="flex flex-wrap gap-2">
              {allowed.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCatId(c.id);
                    setPicks({});
                    setSuggestionId('');
                    if (mode === 'suggestion' && !c.suggestions.length) setMode('main');
                  }}
                  className={`rounded-2xl border px-3.5 py-2 text-sm font-semibold transition ${
                    c.id === catId ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-fg'
                  }`}
                  aria-pressed={c.id === catId}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="label">O que você comeu?</legend>
          <div className="grid grid-cols-2 gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                aria-pressed={mode === m.value}
                className={`rounded-2xl border p-3 text-left transition ${
                  mode === m.value ? 'border-accent bg-accent/10' : 'border-line hover:border-muted/50'
                }`}
              >
                <p className={`text-sm font-semibold ${mode === m.value ? 'text-accent' : ''}`}>{m.label}</p>
                <p className="mt-0.5 text-xs text-muted">{m.hint}</p>
              </button>
            ))}
          </div>
        </fieldset>

        {mode === 'main' && (
          <ul className="space-y-1.5 rounded-2xl bg-surface-2 p-4 text-sm">
            {category.groups.map((g) => (
              <li key={g.id} className="flex justify-between gap-3">
                <span>
                  <span className="text-muted">{g.label}: </span>
                  {g.main.food}
                </span>
                <span className="shrink-0 text-xs text-muted">{portionText(g.main)}</span>
              </li>
            ))}
          </ul>
        )}

        {mode === 'custom-plan' && (
          <div className="space-y-3">
            {category.groups.map((g) => {
              const pick = picks[g.id] ?? { type: 'main' };
              const refGroup = g.groupRef ? getSubstitutionGroup(g.groupRef.group) : undefined;
              const name = `pick-${g.id}`;
              const value =
                pick.type === 'sub' ? `sub:${pick.index}` : pick.type === 'group' ? 'group' : pick.type;
              return (
                <div key={g.id} className="rounded-2xl border border-line/70 p-3">
                  <label className="label" htmlFor={name}>
                    {g.label}
                  </label>
                  <select
                    id={name}
                    className="input"
                    value={value}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'main') setPick(g.id, { type: 'main' });
                      else if (v === 'skip') setPick(g.id, { type: 'skip' });
                      else if (v === 'group') setPick(g.id, { type: 'group', food: refGroup?.items[0]?.food ?? '' });
                      else setPick(g.id, { type: 'sub', index: Number(v.split(':')[1]) });
                    }}
                  >
                    <option value="main">
                      {g.main.food} — {portionText(g.main)} (principal)
                    </option>
                    {g.substitutions.map((s, i) => (
                      <option key={s.food} value={`sub:${i}`}>
                        {s.food} — {portionText(s)}
                      </option>
                    ))}
                    {refGroup && <option value="group">Outro alimento do grupo {refGroup.number} ({refGroup.name})</option>}
                    <option value="skip">Não consumi este item</option>
                  </select>
                  {pick.type === 'group' && refGroup && g.groupRef && (
                    <div className="mt-2">
                      <label className="sr-only" htmlFor={`${name}-group`}>
                        Alimento do grupo {refGroup.number}
                      </label>
                      <select
                        id={`${name}-group`}
                        className="input"
                        value={pick.food}
                        onChange={(e) => setPick(g.id, { type: 'group', food: e.target.value })}
                      >
                        {refGroup.items.map((it) => (
                          <option key={it.food} value={it.food}>
                            {it.food} — 1 porção: {portionText(it)}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-muted">
                        Quantidade indicada: {String(g.groupRef.portions).replace('.', ',')} porção(ões) do grupo{' '}
                        {g.groupRef.group}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mode === 'suggestion' && (
          <div className="space-y-2" role="radiogroup" aria-label="Sugestões de preparo">
            {category.suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={suggestionId === s.id}
                onClick={() => setSuggestionId(s.id)}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  suggestionId === s.id ? 'border-accent bg-accent/10' : 'border-line hover:border-muted/50'
                }`}
              >
                <p className="text-sm font-semibold">
                  {s.number} · {s.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">{s.description}</p>
              </button>
            ))}
          </div>
        )}

        {mode === 'other' && (
          <div>
            <label className="label" htmlFor="other-desc">
              Descrição
            </label>
            <textarea
              id="other-desc"
              className="input min-h-[90px]"
              value={other}
              maxLength={1000}
              onChange={(e) => setOther(e.target.value)}
              placeholder="Ex.: comi metade do arroz e metade de batata"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="meal-time">
              Horário
            </label>
            <input id="meal-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="meal-date">
              Data
            </label>
            <input
              id="meal-date"
              type="date"
              className="input"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="meal-notes">
            Observações pessoais (opcional)
          </label>
          <textarea
            id="meal-notes"
            className="input min-h-[70px]"
            value={notes}
            maxLength={1000}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como se sentiu, fome, saciedade…"
          />
        </div>
      </div>
    </Modal>
  );
}
