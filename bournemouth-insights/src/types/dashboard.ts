export type GeoLevel = 'LocalAuthority'

export interface AreaRef {
  focusLabel: string
  areaName: string
  authorityName: string
  geoLevel: GeoLevel
  areaCode?: string
}

export interface SourceMeta {
  id: string
  name: string
  publisher: string
  url?: string
  license?: string
  retrievedAt: string // ISO date
  notes?: string
}

export interface UpdateMeta {
  lastUpdated: string // ISO date
  dataThroughDate?: string // ISO date
  nextPlannedUpdate?: string // ISO date
}

export type Unit = 'gbp' | 'percent' | 'ratio' | 'count' | 'per_1000'
export type Trend = 'up' | 'down' | 'flat' | 'mixed'

export interface KpiDelta {
  value: number
  unit: Unit
  periodLabel: string
}

export interface KPI {
  id: string
  label: string
  value: number
  unit: Unit
  periodLabel: string
  trend?: Trend
  delta?: KpiDelta
  context?: string
}

export interface TimePoint {
  date: string // ISO date
  value: number
}

export interface TimeSeries {
  id: string
  label: string
  unit: Unit
  points: TimePoint[]
}

export type ChartKind = 'line' | 'bar'

export interface ChartSpec {
  id: string
  kind: ChartKind
  title: string
  subtitle?: string
  seriesIds: string[]
  notes?: string
  sourceIds?: string[]
}

export interface DatasetSectionBase {
  update: UpdateMeta
  kpis: KPI[]
  series: TimeSeries[]
  charts: ChartSpec[]
  sources: SourceMeta[]
}

export interface HousingSection extends DatasetSectionBase {}

export interface SafetyCategoryBreakdownItem {
  category: string
  value: number
  unit: Unit
  periodLabel: string
}

export interface SafetySection extends DatasetSectionBase {
  categoryBreakdown: SafetyCategoryBreakdownItem[]
}

export interface AgeBandItem {
  band: string
  value: number
  unit: 'percent'
  periodLabel: string
}

export interface DemographicsSection extends DatasetSectionBase {
  ageDistribution: AgeBandItem[]
}

export interface EconomySection extends DatasetSectionBase {}

export interface OverviewSection {
  headline: string
  intro: string
  lastUpdated: string // ISO date
  summaryKpis: KPI[]
}

export interface DataStatus {
  mode: 'seed' | 'hybrid' | 'live'
  lastRefreshAt: string // ISO date
  coverageNote: string
  liveIndicators?: {
    sectionId: InsightSectionId | 'overview'
    indicatorId: string
    label: string
    sourceId: string
    coverage: string
  }[]
}

export interface DashboardDataset {
  dataStatus: DataStatus
  area: AreaRef
  overview: OverviewSection
  sections: {
    housing: HousingSection
    safety: SafetySection
    demographics: DemographicsSection
    economy: EconomySection
  }
}

export type InsightSectionId = 'overview' | 'housing' | 'safety' | 'demographics' | 'economy'

export interface Insight {
  id: string
  sectionId: InsightSectionId
  statement: string
  tags: string[]
  periodLabel?: string
  evidence?: string
}
