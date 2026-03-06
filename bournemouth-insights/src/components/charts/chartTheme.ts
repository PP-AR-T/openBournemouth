import type { Unit } from '@/types/dashboard'
import { formatUnitValue } from '@/utils/format'

export const chartPalette = ['currentColor']

const seriesClasses = ['text-sky-800', 'text-indigo-800', 'text-slate-600']

export function seriesColorClassName(index: number): string {
  return seriesClasses[index % seriesClasses.length]!
}

export function formatYear(dateIso: string) {
  return dateIso.slice(0, 4)
}

export function formatAxisTick(value: number, unit: Unit) {
  if (unit === 'gbp') return `£${Math.round(value / 1000)}k`
  if (unit === 'percent') return `${value}%`
  if (unit === 'per_1000') return value.toFixed(0)
  if (unit === 'ratio') return value.toFixed(1)
  return value.toLocaleString('en-GB')
}

export function formatTooltipValue(value: number, unit: Unit) {
  return formatUnitValue(value, unit)
}
