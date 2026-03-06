import type { KPI } from '@/types/dashboard'
import { formatUnitValue } from '@/utils/format'
import { Card } from '@/components/ui/Card'

export function KPICard({ kpi, href }: { kpi: KPI; href?: string }) {
  const content = (
    <Card
      className={[
        'group relative overflow-hidden p-4 motion-safe:animate-fade-in-up',
        href ? 'transition-colors hover:bg-slate-50' : '',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-200 to-indigo-200 opacity-80" />
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{kpi.label}</div>

        <div className="flex items-baseline justify-between gap-3">
          <div className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {formatUnitValue(kpi.value, kpi.unit)}
          </div>
          <div className="text-xs text-slate-500">{kpi.periodLabel}</div>
        </div>

        {kpi.delta ? (
          <div className="text-xs text-slate-600">
            {formatUnitValue(kpi.delta.value, kpi.delta.unit)} {kpi.delta.periodLabel}
          </div>
        ) : null}
        {kpi.context ? <div className="text-xs text-slate-500">{kpi.context}</div> : null}
      </div>
    </Card>
  )

  if (!href) return content

  return (
    <a
      href={href}
      className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
    >
      {content}
    </a>
  )
}
