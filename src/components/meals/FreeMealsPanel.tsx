import { useState } from 'react';
import { Plus, Trash2, Pizza, Heart } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import { FREE_MEAL_GUIDELINES, MEAL_SLOTS } from '../../data/nutrition/plan';
import { freeMealsInWeek } from '../../services/meals/meals';
import { ValidationError } from '../../services/hydration/hydration';
import { addDays, formatFullShort, startOfWeek, toTimeHM } from '../../utils/date';
import type { MealSlotId } from '../../types';
import { Modal, ConfirmDialog } from '../common/Modal';
import { EmptyState } from '../common/ui';

function FreeMealForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addFreeMeal, today } = useAppData();
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(toTimeHM());
  const [slot, setSlot] = useState<MealSlotId | ''>('');
  const [error, setError] = useState('');

  const reset = () => {
    setDescription('');
    setNotes('');
    setDate(today);
    setTime(toTimeHM());
    setSlot('');
    setError('');
  };

  const submit = () => {
    if (date > today) return setError('Não é possível registrar em datas futuras.');
    try {
      addFreeMeal({ dateKey: date, description, notes, time, slot: slot || undefined });
      toast.show('Refeição livre registrada. Aproveite! 🍕');
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof ValidationError ? e.message : 'Não foi possível registrar.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar refeição livre"
      subtitle="Faz parte do plano — não quebra a ofensiva."
      footer={
        <div className="flex items-center gap-3">
          {error && (
            <p className="flex-1 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <button className="btn-water ml-auto px-6" onClick={submit}>
            Registrar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="fm-desc">
            O que você comeu?
          </label>
          <textarea
            id="fm-desc"
            className="input min-h-[80px]"
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: 2 fatias de pizza de calabresa"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="fm-date">
              Data
            </label>
            <input id="fm-date" type="date" className="input" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="fm-time">
              Horário
            </label>
            <input id="fm-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="fm-slot">
            No lugar de qual refeição? (opcional)
          </label>
          <select id="fm-slot" className="input" value={slot} onChange={(e) => setSlot(e.target.value as MealSlotId | '')}>
            <option value="">Não substituiu uma refeição específica</option>
            {MEAL_SLOTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fm-notes">
            Observações (opcional)
          </label>
          <textarea
            id="fm-notes"
            className="input min-h-[60px]"
            value={notes}
            maxLength={1000}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Onde, com quem, como se sentiu…"
          />
        </div>
      </div>
    </Modal>
  );
}

export function FreeMealsPanel() {
  const { data, today, removeFreeMeal } = useAppData();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const week = freeMealsInWeek(data, today);
  const weekStart = startOfWeek(today);
  const limit = FREE_MEAL_GUIDELINES.weeklyLimit;
  const history = [...data.freeMeals].sort((a, b) => (b.dateKey + b.time).localeCompare(a.dateKey + a.time));

  return (
    <div className="space-y-4">
      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-water/15 blur-2xl" aria-hidden />
        <p className="eyebrow">Esta semana</p>
        <p className="text-xs text-muted">
          {formatFullShort(weekStart)} a {formatFullShort(addDays(weekStart, 6))}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex gap-2" aria-label={`${week.length} de ${limit} refeições livres`}>
            {Array.from({ length: Math.max(limit, week.length) }, (_, i) => (
              <span
                key={i}
                className={`grid h-12 w-12 place-items-center rounded-2xl text-xl ${
                  i < week.length ? 'bg-water/15' : 'border-2 border-dashed border-line'
                }`}
                aria-hidden
              >
                {i < week.length ? '🍕' : ''}
              </span>
            ))}
          </div>
          <div className="flex-1 text-sm">
            <p className="font-bold">
              {week.length} de {limit} planejadas
            </p>
            <p className="text-muted">
              {week.length < limit
                ? 'Use quando fizer sentido para você.'
                : week.length === limit
                  ? 'Frequência planejada da semana completa.'
                  : 'Acima do planejado — tudo bem, siga o plano nas próximas refeições.'}
            </p>
          </div>
        </div>
        <button className="btn-water relative mt-4 w-full" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar refeição livre
        </button>
      </section>

      <section className="card">
        <p className="mb-1 flex items-center gap-2 font-bold">
          <Heart className="h-4 w-4 text-water" /> {FREE_MEAL_GUIDELINES.title}
        </p>
        <p className="text-sm leading-relaxed text-muted">{FREE_MEAL_GUIDELINES.intro}</p>
        <ul className="mt-3 space-y-2">
          {FREE_MEAL_GUIDELINES.recommendations.map((r) => (
            <li key={r} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-water" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-2xl bg-water/10 p-3 text-sm text-fg/90">{FREE_MEAL_GUIDELINES.closing}</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold">Histórico de refeições livres</h3>
        {history.length === 0 ? (
          <EmptyState emoji="🍕" title="Nenhuma refeição livre registrada" description="Quando acontecer, registre aqui. Ela faz parte do planejamento." />
        ) : (
          <ul className="space-y-2">
            {history.map((f) => (
              <li key={f.id} className="flex items-start gap-3 rounded-2xl border border-line/70 bg-surface p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-water/10 text-water">
                  <Pizza className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{f.description}</p>
                  <p className="text-xs text-muted">
                    {formatFullShort(f.dateKey)} · {f.time}
                    {f.slot ? ` · no lugar do(a) ${MEAL_SLOTS.find((s) => s.id === f.slot)?.name.toLowerCase()}` : ''}
                  </p>
                  {f.notes && <p className="mt-1 text-xs italic text-muted">“{f.notes}”</p>}
                </div>
                <button className="btn-ghost p-1.5" onClick={() => setConfirmId(f.id)} aria-label="Remover refeição livre">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FreeMealForm open={formOpen} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!confirmId}
        title="Remover refeição livre?"
        message="Este registro será apagado do histórico."
        confirmLabel="Remover"
        danger
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) removeFreeMeal(confirmId);
          setConfirmId(null);
          toast.show('Registro removido', { kind: 'info' });
        }}
      />
    </div>
  );
}
