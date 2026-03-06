import type { SafetySection } from '@/types/dashboard'
import { sources } from './sources'

export const safety: SafetySection = {
  update: {
    lastUpdated: '2026-03-06',
    dataThroughDate: '2025-12-31',
  },
  kpis: [
    {
      id: 'crime_rate',
      label: 'Recorded crime rate',
      value: 86.0,
      unit: 'per_1000',
      periodLabel: '2025',
      trend: 'down',
      delta: { value: -2.4, unit: 'percent', periodLabel: 'vs 2024' },
    },
    {
      id: 'asb_rate',
      label: 'Anti-social behaviour',
      value: 14.2,
      unit: 'per_1000',
      periodLabel: '2025',
      trend: 'flat',
    },
  ],
  series: [
    {
      id: 'crime_per_1000',
      label: 'Recorded crime (per 1,000 residents)',
      unit: 'per_1000',
      points: [
        { date: '2020-12-31', value: 92.0 },
        { date: '2021-12-31', value: 98.0 },
        { date: '2022-12-31', value: 95.0 },
        { date: '2023-12-31', value: 90.0 },
        { date: '2024-12-31', value: 88.1 },
        { date: '2025-12-31', value: 86.0 },
      ],
    },
    {
      id: 'asb_per_1000',
      label: 'Anti-social behaviour (per 1,000 residents)',
      unit: 'per_1000',
      points: [
        { date: '2020-12-31', value: 12.9 },
        { date: '2021-12-31', value: 13.8 },
        { date: '2022-12-31', value: 15.4 },
        { date: '2023-12-31', value: 14.8 },
        { date: '2024-12-31', value: 14.5 },
        { date: '2025-12-31', value: 14.2 },
      ],
    },
  ],
  charts: [
    {
      id: 'safety_crime_trend',
      kind: 'line',
      title: 'Is recorded crime trending up or down?',
      subtitle: 'Per 1,000 residents (annual points)',
      seriesIds: ['crime_per_1000'],
      sourceIds: [sources.policeuk.id],
    },
    {
      id: 'safety_asb_trend',
      kind: 'line',
      title: 'Anti-social behaviour trend',
      subtitle: 'Per 1,000 residents (annual points)',
      seriesIds: ['asb_per_1000'],
      sourceIds: [sources.policeuk.id],
    },
    {
      id: 'safety_categories',
      kind: 'bar',
      title: 'What types of incidents make up the latest snapshot?',
      subtitle: 'Counts (illustrative)',
      seriesIds: [],
      sourceIds: [sources.policeuk.id],
    },
  ],
  categoryBreakdown: [
    { category: 'Violence and sexual offences', value: 6400, unit: 'count', periodLabel: '2025' },
    { category: 'Anti-social behaviour', value: 2200, unit: 'count', periodLabel: '2025' },
    { category: 'Shoplifting', value: 1800, unit: 'count', periodLabel: '2025' },
    { category: 'Vehicle crime', value: 900, unit: 'count', periodLabel: '2025' },
    { category: 'Burglary', value: 780, unit: 'count', periodLabel: '2025' },
  ],
  sources: [sources.policeuk],
}
