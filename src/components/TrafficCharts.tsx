import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrafficStats } from '../services/api';

const CHART_COLOR = '#6366f1';
const GRID_COLOR  = 'rgba(255,255,255,0.06)';
const AXIS_COLOR  = 'rgba(255,255,255,0.25)';

function shortDay(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
}

function hourLabel(h: number) {
  return h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, labelFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-slate-300">{labelFormatter ? labelFormatter(label) : label}</p>
      <p className="font-bold text-white">{payload[0].value} visitas</p>
    </div>
  );
}

export default function TrafficCharts({ data }: { data: TrafficStats }) {
  const peakHour = data.hourly.reduce((max, h) => h.visits > max.visits ? h : max, data.hourly[0]);
  const totalToday = data.daily[data.daily.length - 1]?.visits ?? 0;
  const total30 = data.daily.reduce((s, d) => s + d.visits, 0);

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Visitas hoy',        value: totalToday,                          icon: 'today' },
          { label: 'Últimos 30 días',    value: total30,                             icon: 'calendar_month' },
          { label: 'Hora pico',          value: peakHour ? hourLabel(peakHour.hour) : '—', icon: 'schedule' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="material-symbols-outlined text-xl text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <p className="mt-2 text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="mb-4 text-sm font-semibold text-slate-300">Visitas diarias — últimos 30 días</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLOR} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis
              dataKey="day"
              tick={{ fill: AXIS_COLOR, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
              tickFormatter={shortDay}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip labelFormatter={shortDay} />}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke={CHART_COLOR}
              strokeWidth={2}
              fill="url(#grad)"
              dot={false}
              activeDot={{ r: 4, fill: CHART_COLOR, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="mb-4 text-sm font-semibold text-slate-300">Visitas por hora del día</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.hourly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: AXIS_COLOR, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={2}
              tickFormatter={hourLabel}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip labelFormatter={hourLabel} />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar
              dataKey="visits"
              fill={CHART_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
