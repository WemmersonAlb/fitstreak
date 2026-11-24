import { useRef, useState } from 'react';
import { Upload, FileJson, AlertTriangle } from 'lucide-react';
import { useAppData, type ImportMode } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import { parseBackup, type BackupSummary } from '../../services/backup/backup';
import type { ValidationReport } from '../../services/storage/schema';
import { MAX_IMPORT_BYTES } from '../../constants';
import { formatFullShort, toDateKey, toTimeHM } from '../../utils/date';
import { Modal } from '../common/Modal';

interface Pending {
  fileName: string;
  text: string;
  summary: BackupSummary;
  report: ValidationReport;
}

export function ImportFlow() {
  const { importBackup } = useAppData();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [mode, setMode] = useState<ImportMode>('merge');
  const [confirmStep, setConfirmStep] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File | undefined) => {
    setError('');
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) return setError('Arquivo muito grande para ser um backup do FitStreak.');
    if (!/\.json$/i.test(file.name) && file.type !== 'application/json') return setError('Selecione um arquivo .json de backup.');
    const text = await file.text();
    const parsed = parseBackup(text);
    if (!parsed.ok) return setError(parsed.error);
    setPending({ fileName: file.name, text, summary: parsed.summary, report: parsed.report });
    setMode('merge');
    setConfirmStep(false);
  };

  const close = () => {
    setPending(null);
    setConfirmStep(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const run = () => {
    if (!pending) return;
    const r = importBackup(pending.text, mode);
    if (!r.ok) {
      setError(r.error);
      close();
      return;
    }
    toast.show(mode === 'replace' ? 'Dados substituídos pelo backup.' : 'Backup mesclado com seus dados.');
    close();
  };

  const s = pending?.summary;
  const droppedTotal = pending ? Object.values(pending.report.dropped).reduce((a, b) => a + b, 0) : 0;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        id="import-file"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <label htmlFor="import-file" className="btn-soft w-full cursor-pointer">
        <Upload className="h-4 w-4" /> Importar backup (.json)
      </label>
      {error && (
        <p className="mt-2 flex items-start gap-2 text-sm text-danger" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Modal
        open={!!pending}
        onClose={close}
        title={confirmStep ? 'Confirmar importação' : 'Backup encontrado'}
        subtitle={pending?.fileName}
        footer={
          <div className="flex justify-end gap-2">
            <button className="btn-soft" onClick={confirmStep ? () => setConfirmStep(false) : close}>
              {confirmStep ? 'Voltar' : 'Cancelar'}
            </button>
            {confirmStep ? (
              <button className={mode === 'replace' ? 'btn bg-danger text-white hover:brightness-110' : 'btn-primary'} onClick={run}>
                {mode === 'replace' ? 'Substituir meus dados' : 'Mesclar dados'}
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setConfirmStep(true)}>
                Continuar
              </button>
            )}
          </div>
        }
      >
        {s && !confirmStep && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <FileJson className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold">
                  {s.exportedAt
                    ? `Backup de ${formatFullShort(toDateKey(new Date(s.exportedAt)))} às ${toTimeHM(new Date(s.exportedAt))}`
                    : 'Data do backup desconhecida'}
                </p>
                <p className="text-xs text-muted">
                  Esquema v{s.schemaVersion}
                  {s.firstDay && s.lastDay ? ` · registros de ${formatFullShort(s.firstDay)} a ${formatFullShort(s.lastDay)}` : ''}
                </p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              <li className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Refeições</p>
                <p className="font-bold">{s.mealLogs}</p>
              </li>
              <li className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Registros de água</p>
                <p className="font-bold">{s.waterEntries}</p>
              </li>
              <li className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Refeições livres</p>
                <p className="font-bold">{s.freeMeals}</p>
              </li>
              <li className="rounded-2xl bg-surface-2 p-3">
                <p className="text-xs text-muted">Conquistas · recorde</p>
                <p className="font-bold">
                  {s.achievements} · {s.bestStreak} dia(s)
                </p>
              </li>
            </ul>

            {(droppedTotal > 0 || pending!.report.unknownKeys.length > 0 || pending!.report.warnings.length > 0) && (
              <div className="rounded-2xl border border-warn/40 bg-warn/10 p-3 text-xs">
                <p className="mb-1 font-semibold">Atenção</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {droppedTotal > 0 && <li>{droppedTotal} registro(s) inválido(s) serão ignorados.</li>}
                  {pending!.report.unknownKeys.length > 0 && (
                    <li>Campos desconhecidos preservados sem uso: {pending!.report.unknownKeys.join(', ')}.</li>
                  )}
                  {pending!.report.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <fieldset>
              <legend className="label">Como importar?</legend>
              <div className="space-y-2">
                {(
                  [
                    { v: 'merge', t: 'Mesclar', d: 'Junta com seus dados atuais, sem duplicar registros. Suas configurações são mantidas.' },
                    { v: 'replace', t: 'Substituir', d: 'Troca todos os dados atuais pelos do backup.' },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.v}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-3 ${mode === o.v ? 'border-accent bg-accent/10' : 'border-line'}`}
                  >
                    <input type="radio" name="import-mode" className="mt-1 accent-[rgb(var(--c-accent))]" checked={mode === o.v} onChange={() => setMode(o.v)} />
                    <span>
                      <span className="block font-semibold">{o.t}</span>
                      <span className="text-xs text-muted">{o.d}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
        {confirmStep && (
          <div className="space-y-3 text-sm text-muted">
            <p>
              Antes de {mode === 'replace' ? 'substituir' : 'mesclar'}, o FitStreak criará automaticamente um backup dos seus dados
              atuais neste aparelho (disponível em “Backups automáticos”).
            </p>
            {mode === 'replace' && (
              <p className="rounded-2xl bg-danger/10 p-3 font-medium text-danger">
                Todos os dados atuais serão trocados pelos dados do arquivo. Deseja continuar?
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
