import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

type ToastKind = 'success' | 'info' | 'error';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (message: string, opts?: { kind?: ToastKind; action?: Toast['action']; duration?: number }) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<ToastApi['show']>(
    (message, opts = {}) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-2), { id, kind: opts.kind ?? 'success', message, action: opts.action }]);
      window.setTimeout(() => dismiss(id), opts.duration ?? 3500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const Icon = t.kind === 'error' ? AlertTriangle : t.kind === 'info' ? Info : CheckCircle2;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm shadow-xl shadow-black/20"
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${t.kind === 'error' ? 'text-danger' : t.kind === 'info' ? 'text-water' : 'text-accent'}`}
                aria-hidden
              />
              <span className="flex-1">{t.message}</span>
              {t.action && (
                <button
                  className="font-semibold text-accent hover:underline"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button onClick={() => dismiss(t.id)} aria-label="Fechar aviso" className="text-muted hover:text-fg">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return v;
}
