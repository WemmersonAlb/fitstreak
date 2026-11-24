import { useCallback } from 'react';
import { useAppData } from '../state/AppDataContext';
import { useToast } from '../state/ToastContext';
import { formatMl } from '../utils/format';
import { ValidationError } from '../services/hydration/hydration';

export function useWaterActions() {
  const { addWater, removeWater, undoWater } = useAppData();
  const toast = useToast();

  const add = useCallback(
    (amount: number) => {
      try {
        const entry = addWater(amount);
        toast.show(`+${formatMl(amount)} registrados 💧`, {
          action: { label: 'Desfazer', onClick: () => removeWater(entry.id) },
        });
        return true;
      } catch (e) {
        toast.show(e instanceof ValidationError ? e.message : 'Não foi possível registrar.', { kind: 'error' });
        return false;
      }
    },
    [addWater, removeWater, toast],
  );

  const undo = useCallback(() => {
    const removed = undoWater();
    if (removed) toast.show(`Registro de ${formatMl(removed.amountMl)} desfeito`, { kind: 'info' });
    else toast.show('Nenhum registro para desfazer hoje', { kind: 'info' });
  }, [undoWater, toast]);

  return { add, undo, remove: removeWater };
}
