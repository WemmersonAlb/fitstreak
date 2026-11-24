import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';
import type { WaterPoint, WeekPoint, MonthPoint } from '../../services/stats/stats';
import { formatMl } from '../../utils/format';

const axis = { stroke: 'rgb(var(--c-muted))', fontSize: 11, tickLine: false, axisLine: false } as const;
const grid = { stroke: 'rgb(var(--c-line))', strokeDasharray: '3 3', vertical: false } as const;
const tooltipStyle = {
  contentStyle: {
    background: 'rgb(var(--c-surface-2))',
    border: '1px solid rgb(var(--c-line))',
    borderRadius: 14,
    fontSize: 12,
    color: 'rgb(var(--c-fg))',
  },
  labelStyle: { color: 'rgb(var(--c-muted))' },
  cursor: { fill: 'rgb(var(--c-line) / 0.35)' },
};

export function WaterBarChart({ data, height = 220 }: { data: WaterPoint[]; height?: number }) {
  const goal = data[data.length - 1]?.goal ?? 0;
  const many = data.length > 14;
  return (
    <div style={{ height }} role="img" aria-label="Gráfico de consumo de água por dia">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} interval={many ? Math.ceil(data.length / 7) - 1 : 0} />
          <YAxis {...axis} tickFormatter={(v: number) => `${(v / 1000).toLocaleString('pt-BR')} L`} width={48} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => [formatMl(v), 'Água']} />
          <ReferenceLine y={goal} stroke="rgb(var(--c-water))" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Bar dataKey="ml" radius={[6, 6, 2, 2]} maxBarSize={28}>
            {data.map((d) => (
              <Cell key={d.dateKey} fill={d.goalMet ? 'rgb(var(--c-water))' : 'rgb(var(--c-water) / 0.45)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyMealsChart({ data, height = 220 }: { data: WeekPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Gráfico de refeições registradas por semana">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} allowDecimals={false} width={36} />
          <Tooltip {...tooltipStyle} labelFormatter={(l: string) => `Semana de ${l}`} />
          <Bar dataKey="meals" name="Refeições do plano" stackId="a" fill="rgb(var(--c-accent))" radius={[0, 0, 2, 2]} maxBarSize={32} />
          <Bar dataKey="freeMeals" name="Refeições livres" stackId="a" fill="rgb(var(--c-water))" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StreakLineChart({ data, height = 200 }: { data: { label: string; streak: number }[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Gráfico da evolução da ofensiva">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="streakFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--c-fire))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(var(--c-fire))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} interval={Math.max(0, Math.ceil(data.length / 7) - 1)} />
          <YAxis {...axis} allowDecimals={false} width={36} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} dia(s)`, 'Ofensiva']} />
          <Area type="stepAfter" dataKey="streak" stroke="rgb(var(--c-fire))" strokeWidth={2} fill="url(#streakFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyChart({ data, height = 220 }: { data: MonthPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Gráfico de evolução mensal">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} allowDecimals={false} width={36} />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="trackedDays" name="Dias acompanhados" stroke="rgb(var(--c-accent))" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="goalDays" name="Dias com meta de água" stroke="rgb(var(--c-water))" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
