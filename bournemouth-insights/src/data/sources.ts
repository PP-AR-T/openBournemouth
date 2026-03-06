import type { SourceMeta } from '@/types/dashboard'

export const sources = {
  ukhpi: {
    id: 'ukhpi',
    name: 'UK House Price Index',
    publisher: 'HM Land Registry / ONS',
    url: 'https://publicdata.landregistry.gov.uk/market-trend-data/house-price-index-data/',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-06',
    notes:
      'Housing house-price series is now backed by a generated snapshot from the UKHPI CSV (Land Registry public data). See README for refresh steps.',
  },
  prms: {
    id: 'prms',
    name: 'Private rental market statistics',
    publisher: 'ONS',
    url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/housing/bulletins/privaterentalmarketsummarystatisticsinengland',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-01',
    notes: 'Not yet connected in Phase 1; values are representative samples.',
  },
  policeuk: {
    id: 'policeuk',
    name: 'Police recorded crime and outcomes (API)',
    publisher: 'data.police.uk',
    url: 'https://data.police.uk/docs/',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-01',
    notes: 'Not yet connected in Phase 1; values are representative samples.',
  },
  ons_pop: {
    id: 'ons_pop',
    name: 'Mid-year population estimates',
    publisher: 'ONS',
    url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-06',
    notes:
      'Population series is now snapshot-backed via manual CSV import (data/raw/ons_population.csv). See README for the expected columns and refresh steps.',
  },
  ons_ashe: {
    id: 'ons_ashe',
    name: 'Annual Survey of Hours and Earnings',
    publisher: 'ONS',
    url: 'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-06',
    notes:
      'Median earnings series is now snapshot-backed via manual CSV import (data/raw/ashe_earnings.csv). See README for the expected columns and refresh steps.',
  },
  ons_business: {
    id: 'ons_business',
    name: 'Business counts',
    publisher: 'ONS',
    url: 'https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation',
    license: 'Open Government Licence',
    retrievedAt: '2026-03-01',
    notes: 'Not yet connected in Phase 1; values are representative samples.',
  },
} satisfies Record<string, SourceMeta>
