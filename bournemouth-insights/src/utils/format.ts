import type { Unit } from '@/types/dashboard'

export function formatIsoDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

export function formatUnitValue(value: number, unit: Unit): string {
  switch (unit) {
    case 'gbp':
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: value >= 100 ? 0 : 2,
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'ratio':
      return value.toFixed(1)
    case 'per_1000':
      return value.toFixed(1)
    case 'count':
      return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value)
    default:
      return String(value)
  }
}
