import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../state/AppDataContext';

/** Avisa sobre armazenamento indisponível ou dados recuperados no carregamento. */
export function StorageNotice() {
  const { loadResult, persistent } = useAppData();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  let message: string | null = null;
  if (!persistent) message = 'O armazenamento local está indisponível (modo privado?). Seus registros não serão salvos após fechar o app.';
  else if (loadResult.status === 'corrupted' || loadResult.status === 'recovered') message = loadResult.message ?? null;
  if (!message) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden />
      <div className="flex-1">
        <p>{message}</p>
        {persistent && (
          <Link to="/ajustes" className="mt-1 inline-block font-semibold text-accent hover:underline">
            Ver backups automáticos
          </Link>
        )}
      </div>
      <button onClick={() => setHidden(true)} aria-label="Fechar aviso" className="text-muted hover:text-fg">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
