import type { KPI } from '@/types/dashboard'
import { KPICard } from './KPICard'

export function KPIGrid({
  items,
  hrefForId,
}: {
  items: KPI[]
  hrefForId?: (id: string) => string | undefined
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} href={hrefForId?.(kpi.id)} />
      ))}
    </div>
  )
}
