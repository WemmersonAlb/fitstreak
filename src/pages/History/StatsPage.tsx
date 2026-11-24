import { useMemo, useState, type ReactNode } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAppData } from '../../state/AppDataContext';
import { PageHeader, Segmented, Stat, EmptyState } from '../../components/common/ui';
import { WaterBarChart, WeeklyMealsChart, StreakLineChart, MonthlyChart } from '../../components/charts/Charts';
import { hasDataInRange, monthlySeries, overallStats, streakEvolution, waterSeries, weeklySeries } from '../../services/stats/stats';
import { formatLiters, formatMl, formatPercent, plural } from '../../utils/format';

type Period = '7' | '30' | '90';

function ChartCard({ title, children, empty }: { title: string; children: ReactNode; empty: boolean }) {
  return (
    <section className="card">
      <h2 className="eyebrow mb-3">{title}</h2>
      {empty ? <EmptyState emoji="📈" title="Dados insuficientes" description="Continue registrando para ver este gráfico." /> : children}
    </section>
  );
}

export default function StatsPage() {
  const { data, today, index } = useAppData();
  const [period, setPeriod] = useState<Period>('7');
  const days = Number(period);

  const stats = useMemo(() => overallStats(data, today, index), [data, today, index]);
  const water = useMemo(() => waterSeries(data, today, days, index), [data, today, days, index]);
  const weeks = useMemo(() => weeklySeries(data, today, days === 90 ? 13 : days === 30 ? 5 : 4, index), [data, today, days, index]);
  const streakData = useMemo(() => streakEvolution(data, today, days, index), [data, today, days, index]);
  const months = useMemo(() => monthlySeries(data, today, 6, index), [data, today, index]);

  const periodGoal = water.filter((w) => w.ml > 0);
  const periodGoalRate = periodGoal.length ? periodGoal.filter((w) => w.goalMet).length / periodGoal.length : 0;
  const hasAny = index.size > 0;
  const inRange = hasDataInRange(index, today, days);

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader title="Estatísticas" subtitle="Calculadas apenas a partir dos seus registros." />

      {!hasAny ? (
        <EmptyState emoji="📊" title="Sem dados ainda" description="Registre refeições e água para ver suas estatísticas ganharem vida." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Ofensiva atual" value={plural(stats.currentStreak, 'dia', 'dias')} tone="fire" />
            <Stat label="Maior ofensiva" value={plural(stats.bestStreak, 'dia', 'dias')} tone="fire" />
            <Stat label="Dias acompanhados" value={stats.trackedDays} />
            <Stat label="Refeições registradas" value={stats.totalMeals} tone="accent" />
            <Stat label="Refeições livres" value={stats.totalFreeMeals} tone="water" />
            <Stat label="Média diária de água" value={formatMl(stats.avgWaterMl)} hint="nos dias com registro" tone="water" />
            <Stat label="Dias com meta de água" value={formatPercent(stats.goalRate)} hint={`${stats.goalDays} de ${stats.waterDays} dias`} tone="water" />
            <Stat label="Água acumulada" value={formatLiters(stats.totalWaterMl)} tone="water" />
          </div>

          <div className="sticky top-0 z-20 -mx-4 bg-bg/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
            <Segmented
              label="Período"
              value={period}
              onChange={setPeriod}
              options={[
                { value: '7', label: '7 dias' },
                { value: '30', label: '30 dias' },
                { value: '90', label: '90 dias' },
              ]}
            />
          </div>

          <ChartCard title={`Consumo de água · ${days} dias`} empty={!water.some((w) => w.ml > 0)}>
            <WaterBarChart data={water} />
          </ChartCard>

          <ChartCard title={`Meta de água atingida · ${days} dias`} empty={!periodGoal.length}>
            <div className="flex items-center gap-6">
              <div className="h-36 w-36 shrink-0" role="img" aria-label={`Meta atingida em ${formatPercent(periodGoalRate)} dos dias`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Atingida', value: periodGoal.filter((w) => w.goalMet).length },
                        { name: 'Não atingida', value: periodGoal.filter((w) => !w.goalMet).length },
                      ]}
                      dataKey="value"
                      innerRadius="68%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill="rgb(var(--c-water))" />
                      <Cell fill="rgb(var(--c-surface-2))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-4xl font-black tabular-nums text-water">{formatPercent(periodGoalRate)}</p>
                <p className="text-sm text-muted">
                  {periodGoal.filter((w) => w.goalMet).length} de {periodGoal.length} dias com registro de água
                </p>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Refeições por semana" empty={!weeks.some((w) => w.meals || w.freeMeals)}>
            <WeeklyMealsChart data={weeks} />
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-accent" /> Plano
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-water" /> Livres
              </span>
            </div>
          </ChartCard>

          <ChartCard title={`Evolução da ofensiva · ${days} dias`} empty={!inRange}>
            <StreakLineChart data={streakData} />
          </ChartCard>

          <ChartCard title="Evolução mensal" empty={!months.some((m) => m.trackedDays)}>
            <MonthlyChart data={months} />
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-accent" /> Dias acompanhados
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-water" /> Dias com meta de água
              </span>
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
