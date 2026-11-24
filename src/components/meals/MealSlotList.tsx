import { useState } from 'react';
import { Check, Clock, Plus, Trash2, Pizza } from 'lucide-react';
import type { MealCategoryId, MealSlotId } from '../../types';
import { MEAL_SLOTS, getCategory } from '../../data/nutrition/plan';
import { useAppData } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import { describeMealLog, slotStatuses, type SlotStatus } from '../../services/meals/meals';
import { Modal, ConfirmDialog } from '../common/Modal';
import { Segmented } from '../common/ui';
import { CategoryDetails } from './CategoryDetails';
import { MealLogSheet } from './MealLogSheet';
import { SubstitutionGroupModal } from './SubstitutionGroupModal';

function mainSummary(categoryId: MealCategoryId) {
  const c = getCategory(categoryId)!;
  return c.groups.filter((g) => !g.freeQuantity).map((g) => g.main.food).join(' · ');
}

function StatusBadge({ state }: { state: SlotStatus['state'] }) {
  if (state === 'done')
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white dark:text-[#06210f]" aria-label="Concluída">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  if (state === 'free')
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-water/15 text-water" aria-label="Refeição livre">
        <Pizza className="h-4 w-4" />
      </span>
    );
  return <span className="h-7 w-7 rounded-full border-2 border-dashed border-line" aria-label="Pendente" />;
}

export function SlotSheet({ slotId, open, onClose }: { slotId: MealSlotId; open: boolean; onClose: () => void }) {
  const { data, today, removeMeal } = useAppData();
  const toast = useToast();
  const slot = MEAL_SLOTS.find((s) => s.id === slotId)!;
  const [variant, setVariant] = useState<MealCategoryId>(slot.categories[0]);
  const [logOpen, setLogOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const status = slotStatuses(data, today).find((s) => s.slot.id === slotId)!;
  const category = getCategory(variant)!;

  return (
    <>
      <Modal
        open={open && !logOpen && groupOpen === null && !confirmId}
        onClose={onClose}
        title={`${slot.emoji} ${slot.name}`}
        subtitle={data.settings.mealTimes[slotId] ? `Horário sugerido: ${data.settings.mealTimes[slotId]}` : undefined}
        size="lg"
        footer={
          <button className="btn-primary w-full" onClick={() => setLogOpen(true)}>
            <Plus className="h-4 w-4" /> Registrar {category.name.toLowerCase()}
          </button>
        }
      >
        {status.logs.length > 0 && (
          <div className="mb-5 space-y-2">
            <p className="label">Registrado hoje</p>
            {status.logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 rounded-2xl bg-accent/10 p-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">
                    {getCategory(l.categoryId)?.name} · {l.time}
                  </p>
                  <p className="text-muted">{describeMealLog(l)}</p>
                  {l.notes && <p className="mt-1 text-xs italic text-muted">“{l.notes}”</p>}
                </div>
                <button className="btn-ghost p-1.5" onClick={() => setConfirmId(l.id)} aria-label="Remover registro">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {status.freeMeal && (
          <div className="mb-5 rounded-2xl bg-water/10 p-3 text-sm">
            <p className="font-semibold text-water">Refeição livre 🍕</p>
            <p className="text-muted">{status.freeMeal.description}</p>
          </div>
        )}
        {slot.categories.length > 1 && (
          <div className="mb-4">
            <Segmented
              label="Variações da refeição"
              value={variant}
              onChange={setVariant}
              options={slot.categories.map((id) => ({ value: id, label: getCategory(id)!.name }))}
            />
          </div>
        )}
        <CategoryDetails category={category} onOpenGroup={setGroupOpen} />
      </Modal>
      <MealLogSheet open={logOpen} onClose={() => setLogOpen(false)} slot={slotId} categoryId={variant} />
      <SubstitutionGroupModal group={groupOpen} onClose={() => setGroupOpen(null)} />
      <ConfirmDialog
        open={!!confirmId}
        title="Remover registro?"
        message="O registro desta refeição será apagado. Conquistas já desbloqueadas continuam garantidas."
        confirmLabel="Remover"
        danger
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) removeMeal(confirmId);
          setConfirmId(null);
          toast.show('Registro removido', { kind: 'info' });
        }}
      />
    </>
  );
}

export function MealSlotList({ dateKey }: { dateKey?: string }) {
  const { data, today } = useAppData();
  const key = dateKey ?? today;
  const statuses = slotStatuses(data, key);
  const [openSlot, setOpenSlot] = useState<MealSlotId | null>(null);
  const [quickLog, setQuickLog] = useState<MealSlotId | null>(null);

  return (
    <>
      <ul className="space-y-2">
        {statuses.map((s) => {
          const time = data.settings.mealTimes[s.slot.id];
          const summary =
            s.state === 'done'
              ? s.logs.map(describeMealLog).join(' / ')
              : s.state === 'free'
                ? `Refeição livre: ${s.freeMeal?.description}`
                : mainSummary(s.slot.categories[0]);
          return (
            <li key={s.slot.id}>
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                  s.state === 'pending' ? 'border-line/70 bg-surface' : 'border-transparent bg-surface-2'
                }`}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setOpenSlot(s.slot.id)}
                  aria-label={`Ver ${s.slot.name}`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-xl" aria-hidden>
                    {s.slot.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{s.slot.name}</span>
                      {time && (
                        <span className="flex items-center gap-0.5 text-xs text-muted">
                          <Clock className="h-3 w-3" /> {time}
                        </span>
                      )}
                    </span>
                    <span className={`block truncate text-xs ${s.state === 'pending' ? 'text-muted' : 'text-fg/80'}`}>
                      {summary}
                    </span>
                  </span>
                </button>
                {s.state === 'pending' && key === today ? (
                  <button
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent"
                    onClick={() => setQuickLog(s.slot.id)}
                    aria-label={`Registrar ${s.slot.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : (
                  <StatusBadge state={s.state} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {openSlot && <SlotSheet slotId={openSlot} open onClose={() => setOpenSlot(null)} />}
      <MealLogSheet open={!!quickLog} onClose={() => setQuickLog(null)} slot={quickLog ?? undefined} />
    </>
  );
}
