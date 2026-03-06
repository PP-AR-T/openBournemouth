import type { DashboardDataset, Insight, TimeSeries } from '@/types/dashboard'

function getSeries(dataset: DashboardDataset, id: string): TimeSeries | undefined {
  const all = [
    ...dataset.sections.housing.series,
    ...dataset.sections.safety.series,
    ...dataset.sections.demographics.series,
    ...dataset.sections.economy.series,
  ]
  return all.find((s) => s.id === id)
}

function pctChange(series: TimeSeries): number | undefined {
  if (series.points.length < 2) return undefined
  const first = series.points[0]?.value
  const last = series.points[series.points.length - 1]?.value
  if (!first || !last) return undefined
  return ((last - first) / first) * 100
}

function pctChangeOverlap(a: TimeSeries, b: TimeSeries): {
  aPct: number
  bPct: number
  periodLabel: string
} | null {
  if (a.points.length < 2 || b.points.length < 2) return null

  const aByYear = new Map(a.points.map((p) => [p.date.slice(0, 4), p.value] as const))
  const bByYear = new Map(b.points.map((p) => [p.date.slice(0, 4), p.value] as const))
  const years = Array.from(new Set([...aByYear.keys(), ...bByYear.keys()]))
    .filter((y) => aByYear.has(y) && bByYear.has(y))
    .sort()

  if (years.length < 2) return null

  const start = years[0]!
  const end = years[years.length - 1]!
  const aStart = aByYear.get(start)!
  const aEnd = aByYear.get(end)!
  const bStart = bByYear.get(start)!
  const bEnd = bByYear.get(end)!

  if (!aStart || !aEnd || !bStart || !bEnd) return null

  const aPct = ((aEnd - aStart) / aStart) * 100
  const bPct = ((bEnd - bStart) / bStart) * 100

  return { aPct, bPct, periodLabel: `${start}–${end}` }
}

function range(series: TimeSeries): number | undefined {
  if (series.points.length === 0) return undefined
  const values = series.points.map((p) => p.value)
  return Math.max(...values) - Math.min(...values)
}

function trendDirection(series: TimeSeries): 'up' | 'down' | 'flat' | 'mixed' {
  if (series.points.length < 2) return 'mixed'
  const first = series.points[0]!.value
  const last = series.points[series.points.length - 1]!.value
  const delta = last - first
  if (Math.abs(delta) < 1e-6) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

export function generateInsights(dataset: DashboardDataset): Insight[] {
  const insights: Insight[] = []

  if (dataset.dataStatus.mode === 'hybrid') {
    const liveCount = dataset.dataStatus.liveIndicators?.length ?? 0
    const labels = (dataset.dataStatus.liveIndicators ?? []).map((x) => x.label)
    insights.push({
      id: 'coverage_hybrid',
      sectionId: 'overview',
      tags: ['Coverage', 'Transparency'],
      statement:
        liveCount > 0
          ? 'This dashboard is in hybrid mode: some indicators are snapshot-backed while others remain seeded during Phase 1.'
          : 'This dashboard is in hybrid mode: some indicators are snapshot-backed while others remain seeded during Phase 1.',
      periodLabel: dataset.dataStatus.lastRefreshAt,
      evidence: liveCount > 0 ? `Snapshot-backed: ${labels.join(' · ')}` : undefined,
    })
  }

  const rent = getSeries(dataset, 'private_rent')
  const earnings = getSeries(dataset, 'median_earnings')
  if (rent && earnings) {
    const rentPct = pctChange(rent)
    const earnPct = pctChange(earnings)
    if (rentPct !== undefined && earnPct !== undefined) {
      if (rentPct > earnPct + 2) {
        insights.push({
          id: 'rent_vs_earnings',
          sectionId: 'housing',
          tags: ['Comparison', 'Costs', 'Earnings'],
          statement:
            'In the current sample series, private rents increased faster than median earnings over the same period.',
          periodLabel: `${rent.points[0]!.date.slice(0, 4)}–${rent.points[rent.points.length - 1]!.date.slice(0, 4)}`,
          evidence: `Rent: ${rentPct.toFixed(1)}% vs earnings: ${earnPct.toFixed(1)}%`,
        })
      }
    }
  }

  const housePrice = getSeries(dataset, 'house_price')
  if (housePrice && earnings) {
    const overlap = pctChangeOverlap(housePrice, earnings)
    if (overlap) {
      const housePct = overlap.aPct
      const earnPct = overlap.bPct
      if (housePct > earnPct + 2) {
        insights.push({
          id: 'house_prices_vs_earnings',
          sectionId: 'housing',
          tags: ['Comparison', 'Housing', 'Earnings'],
          statement:
            'House prices have grown faster than earnings over the overlapping period in the current dataset.',
          periodLabel: overlap.periodLabel,
          evidence: `House prices: ${housePct.toFixed(1)}% vs earnings: ${earnPct.toFixed(1)}%`,
        })
      }
    }
  }

  const affordability = dataset.sections.housing.kpis.find((k) => k.id === 'housing_affordability')
  if (affordability && affordability.unit === 'ratio') {
    insights.push({
      id: 'affordability_context',
      sectionId: 'housing',
      tags: ['Definition', 'Context'],
      statement:
        'The affordability ratio is presented as a simple price-to-earnings proxy; exact definitions vary by source and should be checked when comparing areas.',
      periodLabel: affordability.periodLabel,
      evidence: `Ratio: ${affordability.value.toFixed(1)}`,
    })
  }

  const crime = getSeries(dataset, 'crime_per_1000')
  if (crime && crime.points.length >= 3) {
    const latest = crime.points[crime.points.length - 1]!.value
    const peak = Math.max(...crime.points.map((p) => p.value))
    const direction = trendDirection(crime)

    insights.push({
      id: 'crime_trend',
      sectionId: 'safety',
      tags: ['Trend', 'Safety'],
      statement:
        direction === 'down'
          ? 'In the sample series, the recorded crime rate is lower than the earlier peak.'
          : direction === 'up'
            ? 'In the sample series, the recorded crime rate is higher than the earliest point shown.'
            : 'In the sample series, the recorded crime rate is broadly stable over the period shown.',
      periodLabel: `${crime.points[0]!.date.slice(0, 4)}–${crime.points[crime.points.length - 1]!.date.slice(0, 4)}`,
      evidence: `Latest: ${latest.toFixed(1)} per 1,000; peak: ${peak.toFixed(1)} per 1,000`,
    })
  }

  const population = getSeries(dataset, 'population')
  if (population) {
    const popPct = pctChange(population)
    if (popPct !== undefined) {
      insights.push({
        id: 'population_change',
        sectionId: 'demographics',
        tags: ['Trend', 'Population'],
        statement:
          popPct > 0
            ? 'Population in the dataset trends upward across the years shown.'
            : 'Population in the dataset trends downward across the years shown.',
        periodLabel: `${population.points[0]!.date.slice(0, 4)}–${population.points[population.points.length - 1]!.date.slice(0, 4)}`,
        evidence: `Change: ${popPct.toFixed(1)}%`,
      })
    }
  }

  const employment = getSeries(dataset, 'employment_rate')
  if (employment) {
    const spread = range(employment)
    if (spread !== undefined && spread <= 1.5) {
      insights.push({
        id: 'employment_stability',
        sectionId: 'economy',
        tags: ['Stability', 'Labour market'],
        statement:
          'The employment rate in the sample series varies within a relatively narrow range across the years shown.',
        periodLabel: `${employment.points[0]!.date.slice(0, 4)}–${employment.points[employment.points.length - 1]!.date.slice(0, 4)}`,
        evidence: `Range: ${spread.toFixed(1)} percentage points`,
      })
    }
  }

  return insights.slice(0, 5)
}
