import type { OverviewSection } from '@/types/dashboard'

export const overview: OverviewSection = {
  headline: 'Bournemouth / BCP at a glance',
  intro:
    'A small set of public indicators presented neutrally. Phase 1 uses representative sample/partial data with explicit sources and dates.',
  lastUpdated: '2026-03-06',
  summaryKpis: [
    {
      id: 'pop_latest',
      label: 'Estimated population',
      value: 404000,
      unit: 'count',
      periodLabel: '2024 (est.)',
      trend: 'up',
      context: 'Local authority estimate',
    },
    {
      id: 'house_price_latest',
      label: 'Average house price',
      value: 330000,
      unit: 'gbp',
      periodLabel: '2025',
      trend: 'up',
    },
    {
      id: 'rent_latest',
      label: 'Average private rent (monthly)',
      value: 1250,
      unit: 'gbp',
      periodLabel: '2025',
      trend: 'up',
    },
    {
      id: 'employment_rate',
      label: 'Employment rate',
      value: 76.1,
      unit: 'percent',
      periodLabel: '2025',
      trend: 'flat',
    },
  ],
}
