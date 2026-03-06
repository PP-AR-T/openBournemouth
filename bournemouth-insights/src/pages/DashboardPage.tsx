import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LineChartCard } from '@/components/charts/LineChartCard'
import { BarChartCard } from '@/components/charts/BarChartCard'
import { InsightCard } from '@/components/insights/InsightCard'
import { StickySectionNav } from '@/components/nav/StickySectionNav'
import { KPIGrid } from '@/components/kpi/KPIGrid'
import { Tabs, type TabSpec } from '@/components/ui/Tabs'
import { getDashboardDataset } from '@/data/getDashboardDataset'
import { sectionConfigs } from '@/config/sections'
import type { ChartSpec, DashboardDataset, SourceMeta, TimeSeries } from '@/types/dashboard'
import { generateInsights } from '@/utils/insights'
import { formatIsoDate } from '@/utils/format'

function findSeries(all: TimeSeries[], ids: string[]) {
  return ids.map((id) => all.find((s) => s.id === id)).filter(Boolean) as TimeSeries[]
}

function sourcesForChart(chart: ChartSpec, sectionSources: SourceMeta[]): SourceMeta[] {
  if (!chart.sourceIds || chart.sourceIds.length === 0) return []
  const byId = new Map(sectionSources.map((s) => [s.id, s] as const))
  return chart.sourceIds.map((id) => byId.get(id)).filter(Boolean) as SourceMeta[]
}

function formatModeLabel(mode: DashboardDataset['dataStatus']['mode']): string {
  if (mode === 'live') return 'Live (from public sources)'
  if (mode === 'hybrid') return 'Hybrid (some live indicators, some seeded)'
  return 'Sample/seeded (Phase 1)'
}

export function DashboardPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)
  const [housingTab, setHousingTab] = useState('prices')
  const [safetyTab, setSafetyTab] = useState('crime')
  const [populationTab, setPopulationTab] = useState('trend')
  const [economyTab, setEconomyTab] = useState('employment')

  const sectionNavItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'housing', label: 'Housing' },
      { id: 'demographics', label: 'Population' },
      { id: 'economy', label: 'Economy' },
      { id: 'safety', label: 'Safety' },
      { id: 'insights', label: 'Insights' },
    ],
    [],
  )

  const kpiHrefForId = useMemo(() => {
    const map: Record<string, string> = {
      pop_latest: '#demographics',
      house_price_latest: '#housing',
      rent_latest: '#housing',
      employment_rate: '#economy',
    }
    return (id: string) => map[id]
  }, [])

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  const insights = useMemo(() => (dataset ? generateInsights(dataset) : []), [dataset])

  if (!dataset) return <LoadingState label="Loading dashboard dataset…" />

  const housing = dataset.sections.housing
  const safety = dataset.sections.safety
  const demographics = dataset.sections.demographics
  const economy = dataset.sections.economy

  const housingSeries = housing.series
  const safetySeries = safety.series
  const demographicsSeries = demographics.series
  const economySeries = economy.series

  const cfg = Object.fromEntries(sectionConfigs.map((c) => [c.id, c]))

  function renderChart(
    chart: ChartSpec,
    allSeries: TimeSeries[],
    sectionSources: SourceMeta[],
  ): JSX.Element | null {
    if (chart.kind === 'line') {
      const series = findSeries(allSeries, chart.seriesIds)
      if (series.length === 0) return null
      return (
        <LineChartCard
          key={chart.id}
          title={chart.title}
          subtitle={chart.subtitle}
          series={series}
          unit={series[0]!.unit}
          sources={sourcesForChart(chart, sectionSources)}
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
          sources={sourcesForChart(chart, sectionSources)}
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
          sources={sourcesForChart(chart, sectionSources)}
        />
      )
    }

    return null
  }

  const topNarrative =
    'Bournemouth Insights is an experimental public-data dashboard designed to make common indicators easier to find and interpret. It is not an official reporting service; it aims to support transparency and accessibility by showing sources, dates, and cautious summaries.'

  const transparencyNote =
    'Sources and dates are shown for transparency. Definitions, coverage and update frequency can vary by source.'

  return (
    <div className="space-y-4 sm:space-y-6">
      <StickySectionNav items={sectionNavItems} />

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Jump to a section
        </div>
        <KPIGrid items={dataset.overview.summaryKpis} hrefForId={kpiHrefForId} />
      </div>

      <SectionBlock
        id="overview"
        title={dataset.overview.headline}
        description={dataset.overview.intro}
        lastUpdated={dataset.overview.lastUpdated}
        lead={
          <div className="space-y-3">
            <p className="text-sm text-slate-700">{topNarrative}</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <div className="font-medium text-slate-900">Data status</div>
              <div className="mt-1 space-y-1">
                <div>
                  <span className="font-medium">Data mode:</span> {formatModeLabel(dataset.dataStatus.mode)}
                </div>
                <div>
                  <span className="font-medium">Last refresh:</span>{' '}
                  {formatIsoDate(dataset.dataStatus.lastRefreshAt)}
                </div>
                <div>
                  <span className="font-medium">Coverage note:</span> {dataset.dataStatus.coverageNote}
                </div>
                {dataset.dataStatus.liveIndicators && dataset.dataStatus.liveIndicators.length > 0 ? (
                  <div>
                    <span className="font-medium">Snapshot-backed:</span>{' '}
                    {dataset.dataStatus.liveIndicators.map((x, idx) => (
                      <span key={`${x.sectionId}-${x.indicatorId}`}>
                        {idx > 0 ? <span className="px-2 text-slate-300">·</span> : null}
                        <span className="text-slate-800">{x.label}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-slate-600">
                {transparencyNote}{' '}
                <Link
                  to="/methodology"
                  className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Methodology & definitions
                </Link>
                .
              </div>
            </div>
          </div>
        }
      >
        <></>
      </SectionBlock>

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
            Housing pressure often shows up first in prices and rents. This section summarises a few
            headline indicators and then shows longer-run trends, with source and date shown on each chart.
          </p>
          <Tabs
            label="Housing charts"
            tabs={(
              [
                {
                  id: 'prices',
                  label: 'Prices',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        housing.charts.find((c) => c.id === 'housing_prices_trend')!,
                        housingSeries,
                        housing.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'rents',
                  label: 'Rents',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        housing.charts.find((c) => c.id === 'housing_rents_trend')!,
                        housingSeries,
                        housing.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'affordability',
                  label: 'Affordability',
                  content: (
                    <div className="text-sm text-slate-700">
                      Affordability is currently shown via the KPI (price-to-earnings proxy). A dedicated
                      chart can be added when a stable source series is connected.
                    </div>
                  ),
                },
              ] as TabSpec[]
            )}
            activeId={housingTab}
            onChange={setHousingTab}
          />
        </div>
      </SectionBlock>

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
            Safety is multi-dimensional. These metrics are presented as signals to explore further, not as
            a single headline score.
          </p>
          <Tabs
            label="Safety charts"
            tabs={(
              [
                {
                  id: 'crime',
                  label: 'Crime',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        safety.charts.find((c) => c.id === 'safety_crime_trend')!,
                        safetySeries,
                        safety.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'asb',
                  label: 'ASB',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        safety.charts.find((c) => c.id === 'safety_asb_trend')!,
                        safetySeries,
                        safety.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'breakdown',
                  label: 'Breakdown',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        safety.charts.find((c) => c.id === 'safety_categories')!,
                        safetySeries,
                        safety.sources,
                      )}
                    </div>
                  ),
                },
              ] as TabSpec[]
            )}
            activeId={safetyTab}
            onChange={setSafetyTab}
          />
        </div>
      </SectionBlock>

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
            Demographics help interpret change: who lives here, how the age mix shifts, and how quickly the
            local area is growing relative to recent history.
          </p>
          <Tabs
            label="Population charts"
            tabs={(
              [
                {
                  id: 'trend',
                  label: 'Trend',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        demographics.charts.find((c) => c.id === 'demo_population_trend')!,
                        demographicsSeries,
                        demographics.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'age',
                  label: 'Age mix',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        demographics.charts.find((c) => c.id === 'demo_age_structure')!,
                        demographicsSeries,
                        demographics.sources,
                      )}
                    </div>
                  ),
                },
              ] as TabSpec[]
            )}
            activeId={populationTab}
            onChange={setPopulationTab}
          />
        </div>
      </SectionBlock>

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
            The local economy is best read as a set of trends: employment, earnings, and business activity.
            Values here are shown alongside time-series charts to keep interpretation grounded.
          </p>
          <Tabs
            label="Economy charts"
            tabs={(
              [
                {
                  id: 'employment',
                  label: 'Employment',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        economy.charts.find((c) => c.id === 'econ_employment_trend')!,
                        economySeries,
                        economy.sources,
                      )}
                    </div>
                  ),
                },
                {
                  id: 'earnings',
                  label: 'Earnings',
                  content: (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {renderChart(
                        economy.charts.find((c) => c.id === 'econ_earnings_trend')!,
                        economySeries,
                        economy.sources,
                      )}
                    </div>
                  ),
                },
              ] as TabSpec[]
            )}
            activeId={economyTab}
            onChange={setEconomyTab}
          />
        </div>
      </SectionBlock>

      <SectionBlock id="insights" title={cfg.insights.title} description={cfg.insights.description}>
        <div className="space-y-3">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
            These short notes are generated deterministically from the dataset (no AI calls). They’re designed
            to surface gentle patterns and prompt further checking of the underlying charts.
          </p>
          {insights.length === 0 ? (
            <EmptyState
              title="No insights available"
              detail="This can happen if required series are missing."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      </SectionBlock>
    </div>
  )
}
