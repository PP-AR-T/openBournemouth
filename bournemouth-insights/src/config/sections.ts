export type SectionId = 'overview' | 'housing' | 'safety' | 'demographics' | 'economy' | 'insights'

export interface SectionConfig {
  id: SectionId
  title: string
  description: string
}

export const sectionConfigs: SectionConfig[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Key headline indicators and the latest update.',
  },
  {
    id: 'housing',
    title: 'Housing',
    description: 'Prices, rents, affordability, and supply proxies (where available).',
  },
  {
    id: 'safety',
    title: 'Safety',
    description: 'Recorded crime trends and a small category breakdown.',
  },
  {
    id: 'demographics',
    title: 'Population & Demographics',
    description: 'Population size, growth trend, and age distribution snapshot.',
  },
  {
    id: 'economy',
    title: 'Economy',
    description: 'Employment, earnings, and simple economic activity proxies.',
  },
  {
    id: 'insights',
    title: 'Latest insights',
    description: 'A few cautious, factual data briefs generated from the current dataset.',
  },
]
