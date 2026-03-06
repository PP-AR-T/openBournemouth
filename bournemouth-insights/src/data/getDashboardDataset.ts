import type { DashboardDataset } from '@/types/dashboard'
import { site } from '@/config/site'
import { economy } from './economy'
import { housing } from './housing'
import { overview } from './overview'
import { safety } from './safety'
import { demographics } from './population'
import meta from './generated/meta.json'
import ukhpi from './generated/housing.ukhpi.json'
import population from './generated/demographics.ons_population.json'
import ashe from './generated/economy.ons_ashe.json'

type GeneratedMeta = {
  schemaVersion: 1
  generatedAt: string
  liveIndicators: Array<{
    sectionId: 'housing' | 'demographics' | 'economy' | 'safety' | 'overview'
    indicatorId: string
    label: string
    sourceId: string
    coverage: string
  }>
}

type GeneratedHousingUkhpi = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ukhpi'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: {
    id: 'house_price'
    label: string
    unit: 'gbp'
    points: Array<{ date: string; value: number }>
  }
}

type GeneratedDemographicsPopulation = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ons_pop'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: {
    id: 'population'
    label: string
    unit: 'count'
    points: Array<{ date: string; value: number }>
  }
}

type GeneratedEconomyAshe = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ons_ashe'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: {
    id: 'median_earnings'
    label: string
    unit: 'gbp'
    points: Array<{ date: string; value: number }>
  }
}

function isNonEmptyNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

function computePercentDelta(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function computePercentChange(current: number, baseline: number): number {
  if (baseline === 0) return 0
  return ((current - baseline) / baseline) * 100
}

function applyUkhpiToOverview(seed: DashboardDataset['overview'], snapshot: GeneratedHousingUkhpi) {
  if (!snapshot.series.points || snapshot.series.points.length === 0) return seed

  const points = snapshot.series.points.slice().sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]!
  const previous = points.length > 1 ? points[points.length - 2]! : null

  const value = latest.value
  if (!isNonEmptyNumber(value)) return seed

  const periodLabel = latest.date.slice(0, 4)
  const trend =
    previous && isNonEmptyNumber(previous.value)
      ? value > previous.value
        ? ('up' as const)
        : value < previous.value
          ? ('down' as const)
          : ('flat' as const)
      : undefined

  return {
    ...seed,
    lastUpdated: snapshot.generatedAt,
    summaryKpis: seed.summaryKpis.map((k) =>
      k.id === 'house_price_latest'
        ? {
            ...k,
            value,
            unit: 'gbp' as const,
            periodLabel,
            trend,
          }
        : k,
    ),
  }
}

function applyUkhpiToHousing(seed: DashboardDataset['sections']['housing'], snapshot: GeneratedHousingUkhpi) {
  if (!snapshot.series.points || snapshot.series.points.length === 0) return seed

  const points = snapshot.series.points.slice().sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]!
  const previous = points.length > 1 ? points[points.length - 2]! : null

  const updatedSeries = seed.series.map((s) =>
    s.id === 'house_price'
      ? {
          ...s,
          label: snapshot.series.label,
          unit: 'gbp' as const,
          points,
        }
      : s,
  )

  const updatedKpis = seed.kpis.map((k) => {
    if (k.id !== 'housing_avg_price') return k
    const value = latest.value
    if (!isNonEmptyNumber(value)) return k

    const periodLabel = latest.date.slice(0, 4)
    const delta =
      previous && isNonEmptyNumber(previous.value)
        ? {
            value: Number(computePercentDelta(value, previous.value).toFixed(1)),
            unit: 'percent' as const,
            periodLabel: `vs ${previous.date.slice(0, 4)}`,
          }
        : undefined

    const trend = !delta ? k.trend : delta.value > 0 ? 'up' : delta.value < 0 ? 'down' : 'flat'

    return {
      ...k,
      value,
      unit: 'gbp' as const,
      periodLabel,
      trend,
      delta,
      context: 'UKHPI average price (annualised from monthly)',
    }
  })

  return {
    ...seed,
    update: {
      ...seed.update,
      lastUpdated: snapshot.generatedAt,
      dataThroughDate: snapshot.dataThroughDate,
    },
    kpis: updatedKpis,
    series: updatedSeries,
    charts: seed.charts.map((c) =>
      c.id === 'housing_prices_trend'
        ? {
            ...c,
            subtitle: 'UKHPI (annualised from monthly)',
          }
        : c,
    ),
  }
}

function applyPopulationToOverview(seed: DashboardDataset['overview'], snapshot: GeneratedDemographicsPopulation) {
  if (!snapshot.series.points || snapshot.series.points.length === 0) return seed

  const points = snapshot.series.points.slice().sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]!
  const value = latest.value
  if (!isNonEmptyNumber(value)) return seed

  const periodLabel = latest.date.slice(0, 4)

  return {
    ...seed,
    lastUpdated: snapshot.generatedAt,
    summaryKpis: seed.summaryKpis.map((k) =>
      k.id === 'pop_latest'
        ? {
            ...k,
            value,
            unit: 'count' as const,
            periodLabel,
            trend: k.trend,
            context: 'Mid-year population estimate (manual snapshot)',
          }
        : k,
    ),
  }
}

function applyPopulationToDemographics(
  seed: DashboardDataset['sections']['demographics'],
  snapshot: GeneratedDemographicsPopulation,
) {
  if (!snapshot.series.points || snapshot.series.points.length === 0) return seed

  const points = snapshot.series.points.slice().sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]!
  const value = latest.value
  if (!isNonEmptyNumber(value)) return seed

  const baselineIdx = Math.max(0, points.length - 6)
  const baseline = points[baselineIdx]!
  const growth5y =
    isNonEmptyNumber(baseline.value) && baseline.value > 0
      ? Number(computePercentChange(value, baseline.value).toFixed(1))
      : undefined

  const updatedSeries = seed.series.map((s) =>
    s.id === 'population'
      ? {
          ...s,
          label: snapshot.series.label,
          unit: 'count' as const,
          points,
        }
      : s,
  )

  const updatedKpis = seed.kpis.map((k) => {
    if (k.id === 'demo_population') {
      return {
        ...k,
        value,
        unit: 'count' as const,
        periodLabel: latest.date.slice(0, 4),
        trend: k.trend,
      }
    }

    if (k.id === 'demo_growth_5y' && growth5y !== undefined) {
      return {
        ...k,
        value: growth5y,
        unit: 'percent' as const,
        periodLabel: '5y',
        trend: growth5y > 0 ? ('up' as const) : growth5y < 0 ? ('down' as const) : ('flat' as const),
        context: 'Change across the last 5 annual points',
      }
    }

    return k
  })

  return {
    ...seed,
    update: {
      ...seed.update,
      lastUpdated: snapshot.generatedAt,
      dataThroughDate: snapshot.dataThroughDate,
    },
    series: updatedSeries,
    kpis: updatedKpis,
    charts: seed.charts.map((c) =>
      c.id === 'demo_population_trend'
        ? {
            ...c,
            subtitle: 'ONS mid-year estimate (manual snapshot)',
          }
        : c,
    ),
  }
}

function applyAsheToEconomy(seed: DashboardDataset['sections']['economy'], snapshot: GeneratedEconomyAshe) {
  if (!snapshot.series.points || snapshot.series.points.length === 0) return seed

  const points = snapshot.series.points.slice().sort((a, b) => a.date.localeCompare(b.date))
  const latest = points[points.length - 1]!
  const previous = points.length > 1 ? points[points.length - 2]! : null

  const value = latest.value
  if (!isNonEmptyNumber(value)) return seed

  const updatedSeries = seed.series.map((s) =>
    s.id === 'median_earnings'
      ? {
          ...s,
          label: snapshot.series.label,
          unit: 'gbp' as const,
          points,
        }
      : s,
  )

  const updatedKpis = seed.kpis.map((k) => {
    if (k.id !== 'econ_earnings') return k

    const periodLabel = latest.date.slice(0, 4)
    const delta =
      previous && isNonEmptyNumber(previous.value)
        ? {
            value: Number(computePercentDelta(value, previous.value).toFixed(1)),
            unit: 'percent' as const,
            periodLabel: `vs ${previous.date.slice(0, 4)}`,
          }
        : undefined

    const trend = !delta ? k.trend : delta.value > 0 ? 'up' : delta.value < 0 ? 'down' : 'flat'

    return {
      ...k,
      value,
      unit: 'gbp' as const,
      periodLabel,
      trend,
      delta,
      context: 'ASHE median annual earnings (manual snapshot)',
    }
  })

  return {
    ...seed,
    update: {
      ...seed.update,
      lastUpdated: snapshot.generatedAt,
      dataThroughDate: snapshot.dataThroughDate,
    },
    series: updatedSeries,
    kpis: updatedKpis,
    charts: seed.charts.map((c) =>
      c.id === 'econ_earnings_trend'
        ? {
            ...c,
            subtitle: 'ASHE (manual snapshot)',
          }
        : c,
    ),
  }
}

export const dashboardDataset: DashboardDataset = {
  dataStatus: {
    mode: (meta as GeneratedMeta).liveIndicators.length > 0 ? 'hybrid' : 'seed',
    lastRefreshAt: (meta as GeneratedMeta).generatedAt ?? '2026-03-06',
    coverageNote:
      (meta as GeneratedMeta).liveIndicators.length > 0
        ? 'Some indicators are now backed by generated snapshots from official sources; the remainder remain seeded for Phase 1.'
        : 'Phase 1 uses representative sample/partial values while the ingestion pipeline is built. Sources and dates are shown for transparency.',
    liveIndicators: (meta as GeneratedMeta).liveIndicators,
  },
  area: {
    focusLabel: site.focusLabel,
    areaName: 'Bournemouth, Christchurch and Poole',
    authorityName: 'BCP Council',
    geoLevel: 'LocalAuthority',
    areaCode: 'E06000058',
  },
  overview: applyPopulationToOverview(
    applyUkhpiToOverview(overview, ukhpi as GeneratedHousingUkhpi),
    population as GeneratedDemographicsPopulation,
  ),
  sections: {
    housing: applyUkhpiToHousing(housing, ukhpi as GeneratedHousingUkhpi),
    safety,
    demographics: applyPopulationToDemographics(
      demographics,
      population as GeneratedDemographicsPopulation,
    ),
    economy: applyAsheToEconomy(economy, ashe as GeneratedEconomyAshe),
  },
}

export async function getDashboardDataset(): Promise<DashboardDataset> {
  return dashboardDataset
}
