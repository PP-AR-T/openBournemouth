import type { DemographicsSection } from '@/types/dashboard'
import { sources } from './sources'

export const demographics: DemographicsSection = {
  update: {
    lastUpdated: '2026-03-06',
    dataThroughDate: '2024-12-31',
  },
  kpis: [
    {
      id: 'demo_population',
      label: 'Estimated population',
      value: 404000,
      unit: 'count',
      periodLabel: '2024 (est.)',
      trend: 'up',
    },
    {
      id: 'demo_growth_5y',
      label: 'Population growth',
      value: 3.1,
      unit: 'percent',
      periodLabel: '5y',
      trend: 'up',
      context: 'Change over the last 5 annual points',
    },
  ],
  series: [
    {
      id: 'population',
      label: 'Population (estimate)',
      unit: 'count',
      points: [
        { date: '2019-06-30', value: 389000 },
        { date: '2020-06-30', value: 392000 },
        { date: '2021-06-30', value: 396000 },
        { date: '2022-06-30', value: 399000 },
        { date: '2023-06-30', value: 401000 },
        { date: '2024-06-30', value: 404000 },
      ],
    },
  ],
  charts: [
    {
      id: 'demo_population_trend',
      kind: 'line',
      title: 'How has the population changed over time?',
      subtitle: 'Mid-year estimate (annual)',
      seriesIds: ['population'],
      sourceIds: [sources.ons_pop.id],
    },
    {
      id: 'demo_age_structure',
      kind: 'bar',
      title: 'Age distribution (snapshot)',
      subtitle: 'Share of population (illustrative)',
      seriesIds: [],
      sourceIds: [sources.ons_pop.id],
    },
  ],
  ageDistribution: [
    { band: '0–15', value: 16.8, unit: 'percent', periodLabel: '2024 (est.)' },
    { band: '16–24', value: 9.7, unit: 'percent', periodLabel: '2024 (est.)' },
    { band: '25–44', value: 25.5, unit: 'percent', periodLabel: '2024 (est.)' },
    { band: '45–64', value: 25.1, unit: 'percent', periodLabel: '2024 (est.)' },
    { band: '65+', value: 22.9, unit: 'percent', periodLabel: '2024 (est.)' },
  ],
  sources: [sources.ons_pop],
}
