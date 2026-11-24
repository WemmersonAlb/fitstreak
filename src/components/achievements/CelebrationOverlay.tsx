import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppData } from '../../state/AppDataContext';
import type { AchievementDef } from '../../data/achievements/definitions';

const COLORS = ['#4ade80', '#60a5fa', '#fb923c', '#facc15', '#f472b6', '#a78bfa'];

function Confetti({ count = 40, palette = COLORS }: { count?: number; palette?: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 53) % 100) / 60,
        size: 6 + ((i * 7) % 7),
        color: palette[i % palette.length],
        round: i % 3 === 0,
      })),
    [count, palette],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            background: p.color,
            borderRadius: p.round ? '999px' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function SixSeven({ def }: { def: AchievementDef }) {
  return (
    <>
      <Confetti count={70} />
      <div className="relative text-center">
        <div className="mb-2 flex items-end justify-center gap-6 text-7xl font-black tracking-tighter sm:text-8xl">
          <span className="inline-block animate-juggle bg-gradient-to-b from-fire to-warn bg-clip-text text-transparent">6</span>
          <span className="inline-block animate-juggle text-5xl [animation-delay:0.35s]" aria-hidden>
            🤲
          </span>
          <span className="inline-block animate-juggle bg-gradient-to-b from-accent to-water bg-clip-text text-transparent [animation-delay:0.35s]">
            7
          </span>
        </div>
        <p className="text-3xl font-black uppercase tracking-tight">{def.title}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{def.description}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-fire">mãos pra cima e balança 🙌</p>
      </div>
    </>
  );
}

function Thirteen({ def }: { def: AchievementDef }) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-4 grid h-24 w-24 animate-pop place-items-center rounded-full bg-gradient-to-br from-zinc-800 to-black text-5xl shadow-lg ring-1 ring-white/10">
        {def.emoji}
      </div>
      <p className="eyebrow mb-1">sexta-feira? não.</p>
      <p className="text-2xl font-extrabold">{def.title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{def.description}</p>
    </div>
  );
}

function FortyTwo({ def }: { def: AchievementDef }) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-4 grid h-24 w-24 animate-pop place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#a78bfa,#1e1b4b)] text-4xl font-black text-white shadow-lg shadow-violet-500/30">
        42
      </div>
      <p className="eyebrow mb-1">não entre em pânico</p>
      <p className="text-2xl font-extrabold">{def.title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{def.description}</p>
      <p className="mt-3 text-xs text-muted">Leve sua toalha. 🧣</p>
    </div>
  );
}

function DefaultCelebration({ def, legendary }: { def: AchievementDef; legendary?: boolean }) {
  return (
    <>
      <Confetti count={legendary ? 60 : 28} palette={legendary ? ['#facc15', '#fbbf24', '#fde68a', '#fb923c'] : COLORS} />
      <div className="relative text-center">
        <div className="mx-auto mb-4 grid h-24 w-24 animate-pop place-items-center rounded-3xl bg-accent/15 text-5xl">{def.emoji}</div>
        <p className="eyebrow mb-1">{def.secret ? 'conquista secreta desbloqueada' : 'conquista desbloqueada'}</p>
        <p className="text-2xl font-extrabold">{def.title}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{def.description}</p>
      </div>
    </>
  );
}

export function CelebrationOverlay() {
  const { celebrations, dismissCelebration } = useAppData();
  const def = celebrations[0];

  useEffect(() => {
    if (!def) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismissCelebration();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [def, dismissCelebration]);

  if (!def) return null;
  const style = def.celebration ?? 'default';
  const remaining = celebrations.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Conquista desbloqueada: ${def.title}`}
      onClick={dismissCelebration}
    >
      <div
        key={def.id}
        className={`relative w-full max-w-md animate-fade-up overflow-hidden rounded-4xl border p-8 shadow-2xl ${
          style === 'six-seven'
            ? 'border-fire/40 bg-surface'
            : style === 'forty-two'
              ? 'border-violet-400/30 bg-surface'
              : 'border-line bg-surface'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {style === 'six-seven' && <SixSeven def={def} />}
        {style === 'thirteen' && <Thirteen def={def} />}
        {style === 'forty-two' && <FortyTwo def={def} />}
        {(style === 'default' || style === 'legendary') && <DefaultCelebration def={def} legendary={style === 'legendary'} />}
        <button className="btn-primary relative mt-6 w-full" onClick={dismissCelebration} autoFocus>
          {remaining > 0 ? `Próxima (${remaining})` : style === 'six-seven' ? 'SIX SEVEN! 🙌' : 'Bora!'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
