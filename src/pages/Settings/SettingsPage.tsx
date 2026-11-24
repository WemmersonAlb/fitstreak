import { useState, type ReactNode } from 'react';
import { Download, Moon, Sun, Monitor, RotateCcw, History } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import { useToast } from '../../state/ToastContext';
import type { ThemePreference } from '../../types';
import { DEFAULT_WATER_GOAL_ML, MAX_WATER_GOAL_ML, MIN_WATER_GOAL_ML } from '../../constants';
import { MEAL_SLOTS, MEAL_CATEGORIES, NUTRITIONIST, PLAN_VERSION } from '../../data/nutrition/plan';
import { ValidationError } from '../../services/hydration/hydration';
import { PageHeader } from '../../components/common/ui';
import { ConfirmDialog } from '../../components/common/Modal';
import { ImportFlow } from '../../components/backup/ImportFlow';
import { formatMl } from '../../utils/format';
import { formatFullShort, toDateKey, toTimeHM } from '../../utils/date';

function downloadText(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const THEMES: { value: ThemePreference; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

function Section({ title, children, description }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { data, updateSettings, setWaterGoal, setMealTime, exportBackup, listAutoBackups, restoreAutoBackup, persistent } = useAppData();
  const toast = useToast();
  const [goal, setGoal] = useState(String(data.settings.waterGoalMl));
  const [name, setName] = useState(data.settings.userName);
  const [restoreKey, setRestoreKey] = useState<string | null>(null);
  const backups = listAutoBackups();
  const reviewNotes = MEAL_CATEGORIES.flatMap((c) => (c.reviewNotes ?? []).map((n) => ({ cat: c.name, n })));

  const saveGoal = (value = goal) => {
    try {
      setWaterGoal(Number(value));
      setGoal(value);
      toast.show(`Meta de água: ${formatMl(Number(value))}`);
    } catch (e) {
      toast.show(e instanceof ValidationError ? e.message : 'Meta inválida.', { kind: 'error' });
    }
  };

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader title="Ajustes" subtitle="Preferências, backup e informações do plano." />

      <Section title="Perfil">
        <label className="label" htmlFor="user-name">
          Como você quer ser chamado?
        </label>
        <div className="flex gap-2">
          <input
            id="user-name"
            className="input"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome ou apelido"
          />
          <button
            className="btn-primary"
            disabled={name === data.settings.userName}
            onClick={() => {
              updateSettings({ userName: name.trim() });
              toast.show('Nome salvo');
            }}
          >
            Salvar
          </button>
        </div>
      </Section>

      <Section title="Aparência">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => {
            const active = data.settings.theme === t.value;
            return (
              <button
                key={t.value}
                role="radio"
                aria-checked={active}
                onClick={() => updateSettings({ theme: t.value })}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition ${
                  active ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-fg'
                }`}
              >
                <t.icon className="h-5 w-5" /> {t.label}
              </button>
            );
          })}
        </div>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4">
          <span>
            <span className="block text-sm font-semibold">Celebrações de conquistas</span>
            <span className="text-xs text-muted">Mostrar animação ao desbloquear uma conquista</span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[rgb(var(--c-accent))]"
            checked={data.settings.celebrations}
            onChange={(e) => updateSettings({ celebrations: e.target.checked })}
          />
        </label>
      </Section>

      <Section title="Meta de hidratação" description={`Orientação da nutricionista: ${formatMl(DEFAULT_WATER_GOAL_ML)} por dia.`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="goal" className="sr-only">
              Meta diária em ml
            </label>
            <input
              id="goal"
              className="input pr-12"
              type="number"
              inputMode="numeric"
              min={MIN_WATER_GOAL_ML}
              max={MAX_WATER_GOAL_ML}
              step={50}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">ml</span>
          </div>
          <button className="btn-water" onClick={() => saveGoal()} disabled={Number(goal) === data.settings.waterGoalMl}>
            Salvar
          </button>
        </div>
        {data.settings.waterGoalMl !== DEFAULT_WATER_GOAL_ML && (
          <button className="btn-ghost mt-2 px-2 py-1 text-xs" onClick={() => saveGoal(String(DEFAULT_WATER_GOAL_ML))}>
            <RotateCcw className="h-3.5 w-3.5" /> Voltar para {formatMl(DEFAULT_WATER_GOAL_ML)}
          </button>
        )}
        <p className="mt-2 text-xs text-muted">A nova meta vale para hoje e os próximos dias. Dias anteriores mantêm a meta da época.</p>
      </Section>

      <Section title="Horários sugeridos" description="Opcional. Aparecem junto às refeições do dia.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MEAL_SLOTS.map((s) => (
            <div key={s.id}>
              <label className="label" htmlFor={`time-${s.id}`}>
                {s.name}
              </label>
              <input
                id={`time-${s.id}`}
                type="time"
                className="input"
                value={data.settings.mealTimes[s.id]}
                onChange={(e) => setMealTime(s.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Backup dos dados"
        description="Seus dados ficam apenas neste aparelho. Exporte um backup regularmente para não perdê-los."
      >
        {!persistent && (
          <p className="mb-3 rounded-2xl bg-warn/10 p-3 text-xs text-warn">O armazenamento local está indisponível neste navegador.</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="btn-primary"
            onClick={() => {
              const { fileName, content } = exportBackup();
              downloadText(fileName, content);
              toast.show(`Backup exportado: ${fileName}`);
            }}
          >
            <Download className="h-4 w-4" /> Exportar backup
          </button>
          <ImportFlow />
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-muted" /> Backups automáticos
          </p>
          {backups.length === 0 ? (
            <p className="text-xs text-muted">Criados automaticamente antes de importações e recuperações. Nenhum ainda.</p>
          ) : (
            <ul className="space-y-2">
              {backups.map((b) => (
                <li key={b.key} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">
                      {b.createdAt ? `${formatFullShort(toDateKey(new Date(b.createdAt)))} às ${toTimeHM(new Date(b.createdAt))}` : '—'}
                    </p>
                    <p className="text-xs text-muted">{b.reason}</p>
                  </div>
                  <button className="btn-soft px-3 py-1.5 text-xs" onClick={() => setRestoreKey(b.key)}>
                    Restaurar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title="Sobre o plano">
        <p className="text-sm text-muted">
          Plano alimentar de <span className="font-semibold text-fg">{NUTRITIONIST.name}</span> ({NUTRITIONIST.crn}). Versão dos dados:{' '}
          <code className="text-xs">{PLAN_VERSION}</code>. O FitStreak não calcula calorias nem altera quantidades: tudo vem dos
          documentos da nutricionista.
        </p>
        {reviewNotes.length > 0 && (
          <details className="mt-3 rounded-2xl bg-surface-2 p-3 text-xs text-muted">
            <summary className="cursor-pointer font-semibold text-fg">Pontos do PDF para revisar ({reviewNotes.length})</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {reviewNotes.map((r, i) => (
                <li key={i}>
                  <span className="font-medium text-fg">{r.cat}:</span> {r.n}
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="mt-4 text-xs text-muted">FitStreak · feito para uso pessoal · funciona offline.</p>
      </Section>

      <ConfirmDialog
        open={!!restoreKey}
        title="Restaurar backup automático?"
        message="Seus dados atuais serão substituídos por este backup. Antes disso, um novo backup automático dos dados atuais será criado."
        confirmLabel="Restaurar"
        danger
        onCancel={() => setRestoreKey(null)}
        onConfirm={() => {
          const r = restoreAutoBackup(restoreKey!);
          setRestoreKey(null);
          toast.show(r.ok ? 'Backup restaurado.' : r.error, { kind: r.ok ? 'success' : 'error' });
        }}
      />
    </div>
  );
}
