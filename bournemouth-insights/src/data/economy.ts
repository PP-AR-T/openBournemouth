import type { EconomySection } from '@/types/dashboard'
import { sources } from './sources'

export const economy: EconomySection = {
  update: {
    lastUpdated: '2026-03-06',
    dataThroughDate: '2025-12-31',
  },
  kpis: [
    {
      id: 'econ_employment',
      label: 'Employment rate',
      value: 76.1,
      unit: 'percent',
      periodLabel: '2025',
      trend: 'flat',
    },
    {
      id: 'econ_earnings',
      label: 'Median annual earnings',
      value: 33500,
      unit: 'gbp',
      periodLabel: '2025',
      trend: 'up',
      delta: { value: 4.2, unit: 'percent', periodLabel: 'vs 2024' },
    },
    {
      id: 'econ_businesses',
      label: 'Active businesses',
      value: 16600,
      unit: 'count',
      periodLabel: '2025',
      trend: 'up',
      context: 'Business counts are a proxy',
    },
  ],
  series: [
    {
      id: 'employment_rate',
      label: 'Employment rate',
      unit: 'percent',
      points: [
        { date: '2020-12-31', value: 75.4 },
        { date: '2021-12-31', value: 74.9 },
        { date: '2022-12-31', value: 75.6 },
        { date: '2023-12-31', value: 76.0 },
        { date: '2024-12-31', value: 76.2 },
        { date: '2025-12-31', value: 76.1 },
      ],
    },
    {
      id: 'median_earnings',
      label: 'Median annual earnings',
      unit: 'gbp',
      points: [
        { date: '2020-12-31', value: 29500 },
        { date: '2021-12-31', value: 30200 },
        { date: '2022-12-31', value: 31200 },
        { date: '2023-12-31', value: 32000 },
        { date: '2024-12-31', value: 32150 },
        { date: '2025-12-31', value: 33500 },
      ],
    },
  ],
  charts: [
    {
      id: 'econ_employment_trend',
      kind: 'line',
      title: 'Employment rate trend',
      subtitle: 'Annual points',
      seriesIds: ['employment_rate'],
      sourceIds: [sources.ons_ashe.id],
    },
    {
      id: 'econ_earnings_trend',
      kind: 'line',
      title: 'Median earnings trend',
      subtitle: 'Annual points (illustrative)',
      seriesIds: ['median_earnings'],
      sourceIds: [sources.ons_ashe.id],
    },
  ],
  sources: [sources.ons_ashe, sources.ons_business],
}
