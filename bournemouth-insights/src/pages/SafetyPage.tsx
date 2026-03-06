import { useEffect, useMemo, useState } from 'react'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { LoadingState } from '@/components/ui/LoadingState'
import { Tabs, type TabSpec } from '@/components/ui/Tabs'
import { LineChartCard } from '@/components/charts/LineChartCard'
import { BarChartCard } from '@/components/charts/BarChartCard'
import { getDashboardDataset } from '@/data/getDashboardDataset'
import { sectionConfigs } from '@/config/sections'
import type { ChartSpec, DashboardDataset, SourceMeta, TimeSeries } from '@/types/dashboard'

function findSeries(all: TimeSeries[], ids: string[]) {
  return ids.map((id) => all.find((s) => s.id === id)).filter(Boolean) as TimeSeries[]
}

function sourcesForChart(chart: ChartSpec, sectionSources: SourceMeta[]): SourceMeta[] {
  if (!chart.sourceIds || chart.sourceIds.length === 0) return []
  const byId = new Map(sectionSources.map((s) => [s.id, s] as const))
  return chart.sourceIds.map((id) => byId.get(id)).filter(Boolean) as SourceMeta[]
}

export function SafetyPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [tab, setTab] = useState('crime')

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const cfg = useMemo(() => Object.fromEntries(sectionConfigs.map((c) => [c.id, c])), [])

  if (!dataset) return <LoadingState label="Loading safety…" />

  const safety = dataset.sections.safety
  const seriesAll = safety.series

  function renderChart(chartId: string): JSX.Element | null {
    const chart = safety.charts.find((c) => c.id === chartId)
    if (!chart) return null

    if (chart.kind === 'line') {
      const series = findSeries(seriesAll, chart.seriesIds)
      if (series.length === 0) return null

      return (
        <LineChartCard
          key={chart.id}
          title={chart.title}
          subtitle={chart.subtitle}
          series={series}
          unit={series[0]!.unit}
          sources={sourcesForChart(chart, safety.sources)}
        />
      )
    }

    if (chart.kind === 'bar' && chart.id === 'safety_categories') {
      return (
        <BarChartCard
          key={chart.id}
          title="Latest category snapshot"
          subtitle="Counts (illustrative)"
          unit="count"
          data={safety.categoryBreakdown.map((x) => ({ label: x.category, value: x.value }))}
          sources={sourcesForChart(chart, safety.sources)}
        />
      )
    }

    return null
  }

  return (
    <SectionBlock
      id="safety"
      title={cfg.safety.title}
      description={cfg.safety.description}
      lastUpdated={safety.update.lastUpdated}
      kpis={safety.kpis}
      sources={safety.sources}
    >
      <div className="space-y-3">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          Safety is multi-dimensional. These metrics are presented as signals to explore further, not as a single headline score.
        </p>
        <Tabs
          label="Safety charts"
          tabs={(
            [
              {
                id: 'crime',
                label: 'Crime',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('safety_crime_trend')}</div>,
              },
              {
                id: 'asb',
                label: 'ASB',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('safety_asb_trend')}</div>,
              },
              {
                id: 'breakdown',
                label: 'Breakdown',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('safety_categories')}</div>,
              },
            ] as TabSpec[]
          )}
          activeId={tab}
          onChange={setTab}
        />
      </div>
    </SectionBlock>
  )
}
