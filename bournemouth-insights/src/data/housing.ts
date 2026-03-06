import type { HousingSection } from '@/types/dashboard'
import { sources } from './sources'

export const housing: HousingSection = {
  update: {
    lastUpdated: '2026-03-06',
    dataThroughDate: '2025-12-31',
  },
  kpis: [
    {
      id: 'housing_avg_price',
      label: 'Average house price',
      value: 330000,
      unit: 'gbp',
      periodLabel: '2025',
      trend: 'up',
      delta: { value: 3.2, unit: 'percent', periodLabel: 'vs 2024' },
    },
    {
      id: 'housing_avg_rent',
      label: 'Average private rent (monthly)',
      value: 1250,
      unit: 'gbp',
      periodLabel: '2025',
      trend: 'up',
      delta: { value: 5.8, unit: 'percent', periodLabel: 'vs 2024' },
    },
    {
      id: 'housing_affordability',
      label: 'Affordability ratio',
      value: 9.6,
      unit: 'ratio',
      periodLabel: '2025',
      trend: 'up',
      context: 'House price to earnings (sample)',
    },
    {
      id: 'housing_completions',
      label: 'Net additional dwellings',
      value: 1780,
      unit: 'count',
      periodLabel: '2024/25',
      trend: 'mixed',
      context: 'Supply proxy',
    },
  ],
  series: [
    {
      id: 'house_price',
      label: 'Average house price',
      unit: 'gbp',
      points: [
        { date: '2020-12-31', value: 265000 },
        { date: '2021-12-31', value: 287000 },
        { date: '2022-12-31', value: 315000 },
        { date: '2023-12-31', value: 322000 },
        { date: '2024-12-31', value: 320000 },
        { date: '2025-12-31', value: 330000 },
      ],
    },
    {
      id: 'private_rent',
      label: 'Average private rent (monthly)',
      unit: 'gbp',
      points: [
        { date: '2020-12-31', value: 980 },
        { date: '2021-12-31', value: 1020 },
        { date: '2022-12-31', value: 1080 },
        { date: '2023-12-31', value: 1140 },
        { date: '2024-12-31', value: 1180 },
        { date: '2025-12-31', value: 1250 },
      ],
    },
  ],
  charts: [
    {
      id: 'housing_prices_trend',
      kind: 'line',
      title: 'How have average house prices changed?',
      subtitle: 'Annual sample series',
      seriesIds: ['house_price'],
      sourceIds: [sources.ukhpi.id],
    },
    {
      id: 'housing_rents_trend',
      kind: 'line',
      title: 'How have private rents changed?',
      subtitle: 'Monthly rent, annual points',
      seriesIds: ['private_rent'],
      sourceIds: [sources.prms.id],
    },
  ],
  sources: [sources.ukhpi, sources.prms],
}
