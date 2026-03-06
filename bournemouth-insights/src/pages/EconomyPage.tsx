import { useEffect, useMemo, useState } from 'react'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { LoadingState } from '@/components/ui/LoadingState'
import { Tabs, type TabSpec } from '@/components/ui/Tabs'
import { LineChartCard } from '@/components/charts/LineChartCard'
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

export function EconomyPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [tab, setTab] = useState('employment')

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const cfg = useMemo(() => Object.fromEntries(sectionConfigs.map((c) => [c.id, c])), [])

  if (!dataset) return <LoadingState label="Loading economy…" />

  const economy = dataset.sections.economy
  const seriesAll = economy.series

  function renderChart(chartId: string): JSX.Element | null {
    const chart = economy.charts.find((c) => c.id === chartId)
    if (!chart || chart.kind !== 'line') return null

    const series = findSeries(seriesAll, chart.seriesIds)
    if (series.length === 0) return null

    return (
      <LineChartCard
        key={chart.id}
        title={chart.title}
        subtitle={chart.subtitle}
        series={series}
        unit={series[0]!.unit}
        sources={sourcesForChart(chart, economy.sources)}
      />
    )
  }

  return (
    <SectionBlock
      id="economy"
      title={cfg.economy.title}
      description={cfg.economy.description}
      lastUpdated={economy.update.lastUpdated}
      kpis={economy.kpis}
      sources={economy.sources}
    >
      <div className="space-y-3">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          The local economy is best read as a set of trends: employment, earnings, and business activity. Values here are
          shown alongside time-series charts to keep interpretation grounded.
        </p>
        <Tabs
          label="Economy charts"
          tabs={(
            [
              {
                id: 'employment',
                label: 'Employment',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('econ_employment_trend')}</div>,
              },
              {
                id: 'earnings',
                label: 'Earnings',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('econ_earnings_trend')}</div>,
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
