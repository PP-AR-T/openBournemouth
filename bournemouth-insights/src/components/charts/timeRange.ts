import type { TimeSeries } from '@/types/dashboard'

export type TimeRange = '5y' | '10y' | 'all'

function yearOf(dateIso: string): number {
  const y = Number.parseInt(dateIso.slice(0, 4), 10)
  return Number.isFinite(y) ? y : 0
}

export function filterSeriesByTimeRange(series: TimeSeries[], range: TimeRange): TimeSeries[] {
  if (range === 'all') return series

  const latestYear = Math.max(
    ...series.flatMap((s) => s.points.map((p) => yearOf(p.date))),
  )
  if (!Number.isFinite(latestYear) || latestYear <= 0) return series

  const windowYears = range === '5y' ? 5 : 10
  const cutoffYear = latestYear - (windowYears - 1)
  const cutoffDate = `${cutoffYear}-01-01`

  return series.map((s) => ({
    ...s,
    points: s.points.filter((p) => p.date >= cutoffDate),
  }))
}

export function timeRangeLabel(range: TimeRange): string {
  if (range === '5y') return '5Y'
  if (range === '10y') return '10Y'
  return 'All'
}
