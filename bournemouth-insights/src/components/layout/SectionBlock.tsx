import type { ReactNode } from 'react'
import { SectionCard } from '@/components/layout/SectionCard'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { KPIGrid } from '@/components/kpi/KPIGrid'
import { SourceFooter } from '@/components/sources/SourceFooter'
import type { KPI, SourceMeta } from '@/types/dashboard'

function SectionTitle({ title }: { title: string }) {
  return <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</div>
}

export function SectionBlock({
  id,
  title,
  description,
  lastUpdated,
  lead,
  kpis,
  kpisTitle,
  children,
  sources,
  sourcesTitle,
}: {
  id: string
  title: string
  description: string
  lastUpdated?: string
  lead?: ReactNode
  kpis?: KPI[]
  kpisTitle?: string
  children: ReactNode
  sources?: SourceMeta[]
  sourcesTitle?: string
}) {
  return (
    <SectionCard id={id}>
      <div className="space-y-4">
        <SectionHeader title={title} description={description} lastUpdated={lastUpdated} />

        {lead ? <div>{lead}</div> : null}

        {kpis && kpis.length > 0 ? (
          <div className="space-y-3">
            <SectionTitle title={kpisTitle ?? 'KPIs'} />
            <KPIGrid items={kpis} />
          </div>
        ) : null}

        {children}

        {sources && sources.length > 0 ? (
          <div className="space-y-2">
            <SectionTitle title={sourcesTitle ?? 'Sources'} />
            <SourceFooter sources={sources} />
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}
