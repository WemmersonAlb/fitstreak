import { useEffect, useState } from 'react';
import { Plus, Droplets, Check, X as XIcon, Pizza } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import { getCategory } from '../../data/nutrition/plan';
import { mealsForDay, freeMealsForDay } from '../../services/meals/meals';
import { entriesForDay } from '../../services/hydration/hydration';
import { formatLongDate } from '../../utils/date';
import { formatMl } from '../../utils/format';
import { Modal } from '../common/Modal';
import { MealLogSheet } from '../meals/MealLogSheet';
import { WaterEntriesList } from '../hydration/WaterEntriesList';

export function DayDetailModal({ dateKey, onClose }: { dateKey: string | null; onClose: () => void }) {
  const { data, index, today, setDailyNote } = useAppData();
  const toast = useToast();
  const [logOpen, setLogOpen] = useState(false);
  const [note, setNote] = useState('');
  const key = dateKey ?? today;

  useEffect(() => {
    if (dateKey) setNote(data.dailyNotes[dateKey] ?? '');
  }, [dateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const meals = mealsForDay(data, key);
  const free = freeMealsForDay(data, key);
  const water = entriesForDay(data, key);
  const act = index.get(key);
  const totalWater = act?.waterMl ?? 0;
  const goal = act?.goalMl ?? data.settings.waterGoalMl;

  return (
    <>
      <Modal open={!!dateKey && !logOpen} onClose={onClose} title={formatLongDate(key)} subtitle={act?.tracked ? 'Dia acompanhado ✅' : 'Sem registros de atividade'} size="lg">
        <div className="space-y-5">
          {act?.tracked && (
            <p className="rounded-2xl bg-surface-2 px-3 py-2 text-xs text-muted">
              <span className="font-semibold text-fg">Por que conta: </span>
              {act.reasons.join(' · ')}
            </p>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold">Refeições ({meals.length})</h3>
              {key <= today && (
                <button className="btn-soft px-3 py-1.5 text-xs" onClick={() => setLogOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Registrar
                </button>
              )}
            </div>
            {meals.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma refeição registrada.</p>
            ) : (
              <ul className="space-y-2">
                {meals.map((m) => (
                  <li key={m.id} className="rounded-2xl bg-surface-2 p-3 text-sm">
                    <p className="font-semibold">
                      {getCategory(m.categoryId)?.name} <span className="font-normal text-muted">· {m.time}</span>
                    </p>
                    {m.kind === 'suggestion' && <p className="text-muted">Sugestão: {m.suggestionTitle}</p>}
                    {m.kind === 'other' && <p className="text-muted">{m.otherDescription}</p>}
                    {(m.kind === 'main' || m.kind === 'custom-plan') && (
                      <ul className="mt-1 space-y-0.5 text-muted">
                        {m.choices.map((c, i) => (
                          <li key={i}>
                            <span className="text-fg/70">{c.groupLabel}:</span> {c.food}
                            {c.source !== 'main' && <span className="ml-1 text-xs text-accent">(substituição)</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {m.notes && <p className="mt-1 text-xs italic text-muted">“{m.notes}”</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {free.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-bold">Refeição livre</h3>
              {free.map((f) => (
                <div key={f.id} className="flex gap-3 rounded-2xl bg-water/10 p-3 text-sm">
                  <Pizza className="h-5 w-5 shrink-0 text-water" />
                  <div>
                    <p className="font-semibold">{f.description}</p>
                    <p className="text-xs text-muted">{f.time}</p>
                    {f.notes && <p className="mt-1 text-xs italic text-muted">“{f.notes}”</p>}
                  </div>
                </div>
              ))}
            </section>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Droplets className="h-4 w-4 text-water" /> Água: {formatMl(totalWater)} de {formatMl(goal)}
              {water.length > 0 &&
                (totalWater >= goal ? (
                  <span className="chip border-accent/30 bg-accent/10 text-accent">
                    <Check className="h-3 w-3" /> Meta atingida
                  </span>
                ) : (
                  <span className="chip">
                    <XIcon className="h-3 w-3" /> Meta não atingida
                  </span>
                ))}
            </h3>
            {water.length > 0 ? <WaterEntriesList entries={water} /> : <p className="text-sm text-muted">Nenhum registro de água.</p>}
          </section>

          <section>
            <label htmlFor="day-note" className="mb-2 block text-sm font-bold">
              Observações do dia
            </label>
            <textarea
              id="day-note"
              className="input min-h-[70px]"
              value={note}
              maxLength={1000}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Treino, sono, humor… (não conta como atividade)"
            />
            <button
              className="btn-soft mt-2 px-3 py-1.5 text-xs"
              disabled={note === (data.dailyNotes[key] ?? '')}
              onClick={() => {
                setDailyNote(key, note);
                toast.show('Observação salva');
              }}
            >
              Salvar observação
            </button>
          </section>
        </div>
      </Modal>
      <MealLogSheet open={logOpen} onClose={() => setLogOpen(false)} dateKey={key} />
    </>
  );
}
