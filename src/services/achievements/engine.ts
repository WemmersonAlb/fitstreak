import type { AppData } from '../../types';
import { ACHIEVEMENTS, type AchievementDef, type AchievementMetric } from '../../data/achievements/definitions';
import { buildAchievementContext, type AchievementContext } from './context';

export function metricValue(ctx: AchievementContext, metric: AchievementMetric): number {
  switch (metric) {
    case 'bestStreak':
      return ctx.streak.best;
    case 'trackedDays':
      return ctx.trackedKeys.length;
    case 'streakRuns':
      return ctx.streak.runs.length;
    case 'plannedWeek':
      return ctx.plannedWeek ? 1 : 0;
    case 'weekendCombo':
      return ctx.weekendCombo ? 1 : 0;
    case 'newYearStreak':
      return ctx.newYearStreak ? 1 : 0;
    case 'waterOnFreeMealDay':
      return ctx.waterOnFreeMealDay ? 1 : 0;
    default:
      return ctx[metric];
  }
}

export function achievementProgress(ctx: AchievementContext, def: AchievementDef): number {
  return Math.min(1, metricValue(ctx, def.metric) / def.target);
}

export interface EvaluationResult {
  data: AppData;
  unlocked: AchievementDef[];
  context: AchievementContext;
}

/**
 * Atualiza recordes e desbloqueia conquistas. Nunca remove conquistas já desbloqueadas
 * nem reduz o recorde histórico.
 */
export function evaluateAchievements(data: AppData, today: string, now: Date = new Date()): EvaluationResult {
  const context = buildAchievementContext(data, today);
  const unlocked: AchievementDef[] = [];
  const achievements = { ...data.achievements };
  for (const def of ACHIEVEMENTS) {
    if (achievements[def.id]) continue;
    if (metricValue(context, def.metric) >= def.target) {
      achievements[def.id] = { unlockedAt: now.toISOString() };
      unlocked.push(def);
    }
  }

  let records = data.records;
  const best = context.streak.best;
  if (best > data.records.bestStreak) {
    const run = [...context.streak.runs].reverse().find((r) => r.length === best);
    records = { bestStreak: best, bestStreakEnd: run?.end ?? data.records.bestStreakEnd };
  }

  if (!unlocked.length && records === data.records) return { data, unlocked, context };
  return { data: { ...data, achievements, records }, unlocked, context };
}
