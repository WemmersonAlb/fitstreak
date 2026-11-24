import { useEffect, useState } from 'react';
import { toDateKey } from '../utils/date';

/** Data atual (America/Recife), atualizada na virada do dia e ao voltar para o app. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey());
  useEffect(() => {
    const tick = () => setToday((prev) => {
      const next = toDateKey();
      return next === prev ? prev : next;
    });
    const id = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, []);
  return today;
}
