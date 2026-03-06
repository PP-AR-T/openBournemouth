import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useState } from 'react'
import { ChartCard } from './ChartCard'
import { chartPalette, formatAxisTick, formatTooltipValue } from './chartTheme'
import type { SourceMeta, Unit } from '@/types/dashboard'

export interface BarDatum {
  label: string
  value: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

function TooltipContent({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: Array<{ payload?: BarDatum }>
  unit: Unit
}) {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0]?.payload
  if (!datum) return null

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm">
      <div className="font-semibold text-slate-900">{datum.label}</div>
      <div className="mt-1 text-slate-600">{formatTooltipValue(datum.value, unit)}</div>
    </div>
  )
}

export function BarChartCard({
  title,
  subtitle,
  unit,
  data,
  sources,
}: {
  title: string
  subtitle?: string
  unit: Unit
  data: BarDatum[]
  sources?: SourceMeta[]
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const animate = !prefersReducedMotion()

  return (
    <ChartCard title={title} subtitle={subtitle} sources={sources}>
      <div className="h-full w-full text-slate-900">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            onMouseMove={(state) => {
              const idx = typeof state?.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null
              setActiveIndex(idx)
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid stroke="currentColor" className="text-slate-200" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis tickFormatter={(v) => formatAxisTick(v, unit)} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => (
                <TooltipContent active={active} payload={payload as any} unit={unit} />
              )}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar
              dataKey="value"
              fill={chartPalette[0]}
              className="text-sky-800"
              fillOpacity={0.85}
              radius={[6, 6, 0, 0]}
              isAnimationActive={animate}
              animationDuration={420}
              activeBar={
                activeIndex !== null
                  ? { fillOpacity: 0.95, stroke: '#94a3b8', strokeWidth: 1 }
                  : undefined
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
