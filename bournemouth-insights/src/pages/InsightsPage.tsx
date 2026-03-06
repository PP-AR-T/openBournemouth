import { useEffect, useMemo, useState } from 'react'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { InsightCard } from '@/components/insights/InsightCard'
import { getDashboardDataset } from '@/data/getDashboardDataset'
import type { DashboardDataset } from '@/types/dashboard'
import { generateInsights } from '@/utils/insights'

export function InsightsPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const insights = useMemo(() => (dataset ? generateInsights(dataset) : []), [dataset])

  if (!dataset) return <LoadingState label="Loading insights…" />

  return (
    <SectionBlock
      id="insights"
      title="Latest insights"
      description="A few cautious, factual data briefs generated from the current dataset."
    >
      <div className="space-y-3">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          These short notes are generated deterministically from the dataset (no AI calls). They’re designed to surface gentle patterns
          and prompt further checking of the underlying charts.
        </p>
        {insights.length === 0 ? (
          <EmptyState title="No insights available" detail="This can happen if required series are missing." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </SectionBlock>
  )
}
