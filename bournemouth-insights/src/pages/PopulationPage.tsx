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

export function PopulationPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [tab, setTab] = useState('trend')

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const cfg = useMemo(() => Object.fromEntries(sectionConfigs.map((c) => [c.id, c])), [])

  if (!dataset) return <LoadingState label="Loading population…" />

  const demographics = dataset.sections.demographics
  const seriesAll = demographics.series

  function renderChart(chartId: string): JSX.Element | null {
    const chart = demographics.charts.find((c) => c.id === chartId)
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
          sources={sourcesForChart(chart, demographics.sources)}
        />
      )
    }

    if (chart.kind === 'bar' && chart.id === 'demo_age_structure') {
      return (
        <BarChartCard
          key={chart.id}
          title="Age distribution (snapshot)"
          subtitle={demographics.ageDistribution[0]?.periodLabel}
          unit="percent"
          data={demographics.ageDistribution.map((x) => ({ label: x.band, value: x.value }))}
          sources={sourcesForChart(chart, demographics.sources)}
        />
      )
    }

    return null
  }

  return (
    <SectionBlock
      id="demographics"
      title={cfg.demographics.title}
      description={cfg.demographics.description}
      lastUpdated={demographics.update.lastUpdated}
      kpis={demographics.kpis}
      sources={demographics.sources}
    >
      <div className="space-y-3">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          Demographics help interpret change: who lives here, how the age mix shifts, and how quickly the local area is
          growing relative to recent history.
        </p>
        <Tabs
          label="Population charts"
          tabs={(
            [
              {
                id: 'trend',
                label: 'Trend',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('demo_population_trend')}</div>,
              },
              {
                id: 'age',
                label: 'Age mix',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('demo_age_structure')}</div>,
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
