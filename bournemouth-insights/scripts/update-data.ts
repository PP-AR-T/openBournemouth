import fs from 'node:fs/promises'
import path from 'node:path'

type UkhpiRow = {
  areaCode: string
  regionName: string
  dateIso: string
  averagePrice: number
}

type GeneratedSeries = {
  id: string
  label: string
  unit: 'gbp'
  points: Array<{ date: string; value: number }>
}

type GeneratedHousingUkhpi = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ukhpi'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: GeneratedSeries
}

type GeneratedDemographicsPopulation = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ons_pop'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: {
    id: 'population'
    label: string
    unit: 'count'
    points: Array<{ date: string; value: number }>
  }
}

type GeneratedEconomyAshe = {
  schemaVersion: 1
  generatedAt: string
  areaCode: string
  sourceId: 'ons_ashe'
  sourceUrl: string
  dataThroughDate: string
  coverage: string
  series: {
    id: 'median_earnings'
    label: string
    unit: 'gbp'
    points: Array<{ date: string; value: number }>
  }
}

type LiveIndicatorMeta = {
  sectionId: 'housing' | 'demographics' | 'economy' | 'safety' | 'overview'
  indicatorId: string
  label: string
  sourceId: string
  coverage: string
}

type GeneratedMeta = {
  schemaVersion: 1
  generatedAt: string
  liveIndicators: LiveIndicatorMeta[]
}

const DEFAULT_AREA_CODE = 'E06000058'
const DEFAULT_GENERATED_AT = new Date().toISOString().slice(0, 10)
// NOTE: The UKHPI publishes monthly versioned files. We default to the latest known stable
// release for this repo (Dec 2025). You can override with `--ukhpiUrl <url>`.
const UKHPI_CSV_URL =
  'https://publicdata.landregistry.gov.uk/market-trend-data/house-price-index-data/UK-HPI-full-file-2025-12.csv'

const DEFAULT_POPULATION_CSV = 'ons_population.csv'
const DEFAULT_ASHE_CSV = 'ashe_earnings.csv'

function argValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name)
  if (idx === -1) return undefined
  return args[idx + 1]
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replaceAll(' ', '').replaceAll('_', '')
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)

  if (lines.length === 0) throw new Error('CSV is empty')
  const header = parseCsvLine(lines[0]!)
  const rows = lines.slice(1).map(parseCsvLine)
  return { header, rows }
}

function pickColumnIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map(normalizeHeader)
  for (const c of candidates) {
    const idx = normalized.indexOf(normalizeHeader(c))
    if (idx !== -1) return idx
  }
  return -1
}

function toIsoDate(raw: string): string {
  const trimmed = raw.trim()
  // UKHPI commonly uses dd/mm/yyyy. Parse this explicitly first to avoid locale ambiguity.
  const m = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const dd = m[1]!.padStart(2, '0')
    const mm = m[2]!.padStart(2, '0')
    const yyyy = m[3]!
    return `${yyyy}-${mm}-${dd}`
  }

  const date = new Date(trimmed)
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)

  throw new Error(`Unparseable date: ${raw}`)
}

async function readTextFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`)
  return await res.text()
}

function parseUkhpi(text: string): UkhpiRow[] {
  const { header, rows } = parseCsv(text)

  const areaCodeIdx = pickColumnIndex(header, ['Area_Code', 'AreaCode', 'Region_Code', 'RegionCode'])
  const regionNameIdx = pickColumnIndex(header, ['Region_Name', 'RegionName', 'Area_Name', 'AreaName'])
  const dateIdx = pickColumnIndex(header, ['Date', 'date'])
  const avgPriceIdx = pickColumnIndex(header, ['AveragePrice', 'Average_Price', 'Average Price'])

  if (areaCodeIdx === -1 || regionNameIdx === -1 || dateIdx === -1 || avgPriceIdx === -1) {
    throw new Error(
      `Unexpected UKHPI CSV headers. Required columns not found. Found: ${header.slice(0, 12).join(', ')}`,
    )
  }

  const parsed: UkhpiRow[] = []
  for (const r of rows) {
    const areaCode = (r[areaCodeIdx] ?? '').trim()
    const regionName = (r[regionNameIdx] ?? '').trim()
    const dateIso = toIsoDate(r[dateIdx] ?? '')
    const avgRaw = (r[avgPriceIdx] ?? '').trim()
    const averagePrice = Number.parseFloat(avgRaw)
    if (!areaCode || !regionName || !Number.isFinite(averagePrice)) continue
    parsed.push({ areaCode, regionName, dateIso, averagePrice })
  }
  return parsed
}

function parseYearLike(raw: string): string | null {
  const trimmed = raw.trim()
  const yearMatch = trimmed.match(/^(\d{4})$/)
  if (yearMatch) return yearMatch[1]!

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return isoMatch[1]!

  const ukMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ukMatch) return ukMatch[3]!

  return null
}

function parseManualPopulationCsv(text: string, areaCode: string): {
  points: Array<{ date: string; value: number }>
  dataThroughDate: string
} {
  const { header, rows } = parseCsv(text)

  const areaIdx = pickColumnIndex(header, ['areaCode', 'area_code', 'areacode', 'code', 'ladcd'])
  const yearIdx = pickColumnIndex(header, ['year', 'date', 'midyear', 'mid_year'])
  const popIdx = pickColumnIndex(header, ['population', 'value', 'pop'])

  if (areaIdx === -1 || yearIdx === -1 || popIdx === -1) {
    throw new Error(
      `Population CSV headers not recognised. Expected columns like areaCode, year, population. Found: ${header.slice(0, 12).join(', ')}`,
    )
  }

  const byYear = new Map<string, number>()
  for (const r of rows) {
    const area = (r[areaIdx] ?? '').trim()
    if (area !== areaCode) continue

    const year = parseYearLike(r[yearIdx] ?? '')
    if (!year) continue

    const value = Number.parseFloat((r[popIdx] ?? '').toString())
    if (!Number.isFinite(value)) continue

    byYear.set(year, Math.round(value))
  }

  const years = Array.from(byYear.keys()).sort()
  const points = years.map((y) => ({ date: `${y}-06-30`, value: byYear.get(y)! }))
  const dataThroughDate = years.length > 0 ? `${years[years.length - 1]}-06-30` : DEFAULT_GENERATED_AT

  return { points, dataThroughDate }
}

function parseManualAsheCsv(text: string, areaCode: string): {
  points: Array<{ date: string; value: number }>
  dataThroughDate: string
} {
  const { header, rows } = parseCsv(text)

  const areaIdx = pickColumnIndex(header, ['areaCode', 'area_code', 'areacode', 'code', 'ladcd'])
  const yearIdx = pickColumnIndex(header, ['year', 'date'])
  const earnIdx = pickColumnIndex(header, ['medianAnnualEarningsGbp', 'medianearnings', 'median_earnings', 'earnings', 'value'])

  if (areaIdx === -1 || yearIdx === -1 || earnIdx === -1) {
    throw new Error(
      `ASHE earnings CSV headers not recognised. Expected columns like areaCode, year, medianAnnualEarningsGbp. Found: ${header.slice(0, 12).join(', ')}`,
    )
  }

  const byYear = new Map<string, number>()
  for (const r of rows) {
    const area = (r[areaIdx] ?? '').trim()
    if (area !== areaCode) continue

    const year = parseYearLike(r[yearIdx] ?? '')
    if (!year) continue

    const value = Number.parseFloat((r[earnIdx] ?? '').toString())
    if (!Number.isFinite(value)) continue

    byYear.set(year, Math.round(value))
  }

  const years = Array.from(byYear.keys()).sort()
  const points = years.map((y) => ({ date: `${y}-12-31`, value: byYear.get(y)! }))
  const dataThroughDate = years.length > 0 ? `${years[years.length - 1]}-12-31` : DEFAULT_GENERATED_AT

  return { points, dataThroughDate }
}

function toAnnualSeries(rows: UkhpiRow[], areaCode: string): {
  points: Array<{ date: string; value: number }>
  dataThroughDate: string
  coverage: string
} {
  const filtered = rows.filter((r) => r.areaCode === areaCode)
  if (filtered.length === 0) throw new Error(`No UKHPI rows found for areaCode ${areaCode}`)

  const byYear = new Map<string, { dateIso: string; value: number }>()
  for (const r of filtered) {
    const year = r.dateIso.slice(0, 4)
    const existing = byYear.get(year)
    if (!existing || r.dateIso > existing.dateIso) {
      byYear.set(year, { dateIso: r.dateIso, value: r.averagePrice })
    }
  }

  const years = Array.from(byYear.keys()).sort()
  const points = years.map((y) => ({ date: `${y}-12-31`, value: Math.round(byYear.get(y)!.value) }))
  const dataThroughDate = years.length > 0 ? byYear.get(years[years.length - 1]!)!.dateIso : DEFAULT_GENERATED_AT

  const coverage = `Annualised from monthly UKHPI average price for ${areaCode}; each point uses the latest available month in that calendar year.`

  return { points, dataThroughDate, coverage }
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

async function main() {
  const args = process.argv.slice(2)
  const areaCode = argValue(args, '--area') ?? DEFAULT_AREA_CODE
  const generatedAt = argValue(args, '--generatedAt') ?? DEFAULT_GENERATED_AT

  const repoRoot = process.cwd()
  const rawDir = path.join(repoRoot, 'data', 'raw')
  const rawUkhpiCsvPath = path.join(rawDir, 'ukhpi.csv')
  const rawPopulationCsvPath = path.join(rawDir, DEFAULT_POPULATION_CSV)
  const rawAsheCsvPath = path.join(rawDir, DEFAULT_ASHE_CSV)
  const outDir = path.join(repoRoot, 'src', 'data', 'generated')

  const rawOverride = argValue(args, '--ukhpi')
  const ukhpiUrlOverride = argValue(args, '--ukhpiUrl')
  const rawPathToRead = rawOverride ? path.resolve(rawOverride) : rawUkhpiCsvPath

  const rawLocal = await readTextFileIfExists(rawPathToRead)

  let ukhpiCsv: string
  let sourceUrl: string
  if (rawLocal) {
    ukhpiCsv = rawLocal
    sourceUrl = `file:${path.relative(repoRoot, rawPathToRead).replaceAll('\\', '/')}`
  } else {
    const url = ukhpiUrlOverride ?? UKHPI_CSV_URL
    ukhpiCsv = await fetchText(url)
    sourceUrl = url
  }

  const ukhpiRows = parseUkhpi(ukhpiCsv)
  const { points, dataThroughDate, coverage } = toAnnualSeries(ukhpiRows, areaCode)

  const housingUkhpi: GeneratedHousingUkhpi = {
    schemaVersion: 1,
    generatedAt,
    areaCode,
    sourceId: 'ukhpi',
    sourceUrl,
    dataThroughDate,
    coverage,
    series: {
      id: 'house_price',
      label: 'Average house price',
      unit: 'gbp',
      points,
    },
  }

  const populationPathOverride = argValue(args, '--population')
  const populationPathToRead = populationPathOverride
    ? path.resolve(populationPathOverride)
    : rawPopulationCsvPath
  const rawPopulation = await readTextFileIfExists(populationPathToRead)

  let demographicsPopulation: GeneratedDemographicsPopulation | null = null
  if (rawPopulation) {
    const { points: popPoints, dataThroughDate: popThrough } = parseManualPopulationCsv(
      rawPopulation,
      areaCode,
    )

    demographicsPopulation = {
      schemaVersion: 1,
      generatedAt,
      areaCode,
      sourceId: 'ons_pop',
      sourceUrl: `file:${path.relative(repoRoot, populationPathToRead).replaceAll('\\', '/')}`,
      dataThroughDate: popThrough,
      coverage:
        'Population series is snapshot-backed from a manually provided CSV export of ONS mid-year population estimates for the local authority.',
      series: {
        id: 'population',
        label: 'Population (estimate)',
        unit: 'count',
        points: popPoints,
      },
    }
  }

  const ashePathOverride = argValue(args, '--ashe')
  const ashePathToRead = ashePathOverride ? path.resolve(ashePathOverride) : rawAsheCsvPath
  const rawAshe = await readTextFileIfExists(ashePathToRead)

  let economyAshe: GeneratedEconomyAshe | null = null
  if (rawAshe) {
    const { points: earnPoints, dataThroughDate: earnThrough } = parseManualAsheCsv(rawAshe, areaCode)

    economyAshe = {
      schemaVersion: 1,
      generatedAt,
      areaCode,
      sourceId: 'ons_ashe',
      sourceUrl: `file:${path.relative(repoRoot, ashePathToRead).replaceAll('\\', '/')}`,
      dataThroughDate: earnThrough,
      coverage:
        'Median earnings series is snapshot-backed from a manually provided CSV export of ONS ASHE (or equivalent official extract).',
      series: {
        id: 'median_earnings',
        label: 'Median annual earnings',
        unit: 'gbp',
        points: earnPoints,
      },
    }
  }

  const meta: GeneratedMeta = {
    schemaVersion: 1,
    generatedAt,
    liveIndicators: [
      {
        sectionId: 'housing',
        indicatorId: 'house_price',
        label: 'Average house price (UKHPI)',
        sourceId: 'ukhpi',
        coverage: housingUkhpi.coverage,
      },
      {
        sectionId: 'demographics',
        indicatorId: 'population',
        label: 'Population (ONS mid-year, manual import)',
        sourceId: 'ons_pop',
        coverage:
          'Snapshot-backed via manual CSV import. Replace data/raw/ons_population.csv with an official extract to publish real values.',
      },
      {
        sectionId: 'economy',
        indicatorId: 'median_earnings',
        label: 'Median annual earnings (ASHE, manual import)',
        sourceId: 'ons_ashe',
        coverage:
          'Snapshot-backed via manual CSV import. Replace data/raw/ashe_earnings.csv with an official extract to publish real values.',
      },
    ],
  }

  await fs.mkdir(rawDir, { recursive: true })
  await fs.mkdir(outDir, { recursive: true })

  await writeJson(path.join(outDir, 'housing.ukhpi.json'), housingUkhpi)
  if (demographicsPopulation) {
    await writeJson(path.join(outDir, 'demographics.ons_population.json'), demographicsPopulation)
  }
  if (economyAshe) {
    await writeJson(path.join(outDir, 'economy.ons_ashe.json'), economyAshe)
  }
  await writeJson(path.join(outDir, 'meta.json'), meta)

  console.log(`Wrote ${path.relative(repoRoot, path.join(outDir, 'housing.ukhpi.json'))}`)
  if (demographicsPopulation) {
    console.log(`Wrote ${path.relative(repoRoot, path.join(outDir, 'demographics.ons_population.json'))}`)
  } else {
    console.log(
      `Skipped demographics population snapshot (missing ${path.relative(repoRoot, rawPopulationCsvPath)}; provide --population <path>)`,
    )
  }
  if (economyAshe) {
    console.log(`Wrote ${path.relative(repoRoot, path.join(outDir, 'economy.ons_ashe.json'))}`)
  } else {
    console.log(
      `Skipped economy earnings snapshot (missing ${path.relative(repoRoot, rawAsheCsvPath)}; provide --ashe <path>)`,
    )
  }
  console.log(`Wrote ${path.relative(repoRoot, path.join(outDir, 'meta.json'))}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
