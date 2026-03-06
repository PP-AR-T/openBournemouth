import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo, useState } from 'react'
import type { SourceMeta, TimeSeries, Unit } from '@/types/dashboard'
import { ChartCard } from './ChartCard'
import { formatAxisTick, formatTooltipValue, formatYear, seriesColorClassName } from './chartTheme'
import { TimeRangeToggle } from './TimeRangeToggle'
import { filterSeriesByTimeRange, type TimeRange } from './timeRange'

type Row = { date: string } & Record<string, number | string>

function toRows(series: TimeSeries[]): Row[] {
  const dates = Array.from(
    new Set(series.flatMap((s) => s.points.map((p) => p.date))),
  ).sort()

  return dates.map((date) => {
    const row: Row = { date }
    for (const s of series) {
      const point = s.points.find((p) => p.date === date)
      if (point) row[s.id] = point.value
    }
    return row
  })
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

function findPreviousPoint(series: TimeSeries, date: string): number | null {
  const idx = series.points.findIndex((p) => p.date === date)
  if (idx <= 0) return null
  const prev = series.points[idx - 1]
  if (!prev) return null
  return typeof prev.value === 'number' && Number.isFinite(prev.value) ? prev.value : null
}

function TooltipContent({
  active,
  label,
  payload,
  unit,
  series,
}: {
  active?: boolean
  label?: string
  payload?: Array<{ dataKey?: string; value?: number; name?: string; stroke?: string }>
  unit: Unit
  series: TimeSeries[]
}) {
  if (!active || !label || !payload || payload.length === 0) return null

  const items = payload
    .filter((p) => typeof p.value === 'number' && Number.isFinite(p.value))
    .map((p) => {
      const key = (p.dataKey ?? '') as string
      const s = series.find((x) => x.id === key)
      const prev = s ? findPreviousPoint(s, label) : null
      const delta = prev !== null ? (p.value! - prev) : null
      const pct = prev && prev !== 0 ? (delta! / prev) * 100 : null
      return {
        key,
        name: p.name ?? s?.label ?? key,
        value: p.value!,
        delta,
        pct,
      }
    })

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-2 space-y-1">
        {items.map((it) => (
          <div key={it.key} className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 truncate text-slate-600">{it.name}</div>
            <div className="shrink-0 text-right">
              <div className="font-medium text-slate-900">{formatTooltipValue(it.value, unit)}</div>
              {it.delta !== null && it.pct !== null ? (
                <div className="text-[11px] text-slate-500">
                  {it.delta >= 0 ? '+' : ''}
                  {formatTooltipValue(it.delta, unit)} ({it.pct >= 0 ? '+' : ''}
                  {it.pct.toFixed(1)}%)
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChartCard({
  title,
  subtitle,
  series,
  unit,
  sources,
}: {
  title: string
  subtitle?: string
  series: TimeSeries[]
  unit: Unit
  sources?: SourceMeta[]
}) {
  const [range, setRange] = useState<TimeRange>('all')
  const filteredSeries = useMemo(() => filterSeriesByTimeRange(series, range), [series, range])
  const rows = useMemo(() => toRows(filteredSeries), [filteredSeries])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const animate = !prefersReducedMotion()

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      sources={sources}
      headerRight={<TimeRangeToggle value={range} onChange={setRange} />}
    >
      <div className="h-full w-full text-slate-900">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              const key = (state?.activePayload?.[0]?.dataKey as string | undefined) ?? null
              setActiveKey(key)
            }}
            onMouseLeave={() => setActiveKey(null)}
          >
            <CartesianGrid stroke="currentColor" className="text-slate-200" strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatYear} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatAxisTick(v, unit)} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, label, payload }) => (
                <TooltipContent
                  active={active}
                  label={label as string | undefined}
                  payload={payload as any}
                  unit={unit}
                  series={filteredSeries}
                />
              )}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            {filteredSeries.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}

            {filteredSeries.map((s, idx) => {
              const dim = activeKey && activeKey !== s.id
              return (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.label}
                stroke="currentColor"
                className={seriesColorClassName(idx)}
                strokeWidth={dim ? 2 : 2.8}
                strokeOpacity={dim ? 0.25 : 1}
                dot={false}
                isAnimationActive={animate}
                animationDuration={420}
                strokeDasharray={idx === 0 ? undefined : '6 3'}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
