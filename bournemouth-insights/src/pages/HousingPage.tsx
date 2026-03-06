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

export function HousingPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [tab, setTab] = useState('prices')

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const cfg = useMemo(() => Object.fromEntries(sectionConfigs.map((c) => [c.id, c])), [])

  if (!dataset) return <LoadingState label="Loading housing…" />

  const housing = dataset.sections.housing
  const seriesAll = housing.series

  function renderChart(chartId: string): JSX.Element | null {
    const chart = housing.charts.find((c) => c.id === chartId)
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
        sources={sourcesForChart(chart, housing.sources)}
      />
    )
  }

  return (
    <SectionBlock
      id="housing"
      title={cfg.housing.title}
      description={cfg.housing.description}
      lastUpdated={housing.update.lastUpdated}
      kpis={housing.kpis}
      sources={housing.sources}
    >
      <div className="space-y-3">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          Housing pressure often shows up first in prices and rents. This section summarises headline indicators
          and then shows longer-run trends, with source and date shown on each chart.
        </p>
        <Tabs
          label="Housing charts"
          tabs={(
            [
              {
                id: 'prices',
                label: 'Prices',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('housing_prices_trend')}</div>,
              },
              {
                id: 'rents',
                label: 'Rents',
                content: <div className="grid gap-3 lg:grid-cols-2">{renderChart('housing_rents_trend')}</div>,
              },
              {
                id: 'affordability',
                label: 'Affordability',
                content: (
                  <div className="text-sm text-slate-700">
                    Affordability is currently shown via the KPI (price-to-earnings proxy). A dedicated chart can be added
                    when a stable source series is connected.
                  </div>
                ),
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
