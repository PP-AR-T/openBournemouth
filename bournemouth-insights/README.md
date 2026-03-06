# Bournemouth Insights (Phase 1)

A small, neutral, data-driven dashboard of public indicators for **Bournemouth / BCP**.

Phase 1 is intentionally read-only: KPIs, charts, source labels, and a handful of cautious “short insights” generated deterministically from the dataset.

This repo now supports a **hybrid** approach: some indicators can be backed by generated snapshots from official public datasets, while others remain seeded.

## Goals

- Present a clean, credible set of indicators (not activism, not a forum).
- Be easy to extend to real public data refresh jobs and APIs later.
- Keep structure production-minded while using local data for MVP speed.

## Local development

### Prerequisites

- Node.js **20+** (LTS recommended)

### Run

```bash
cd bournemouth-insights
npm install
npm run dev
```

Then open the URL shown by Vite (typically `http://localhost:5173`).

## Project structure (high level)

- `src/pages/` – route-level pages (`DashboardPage`, `AboutPage`)
- `src/components/` – reusable UI (layout, KPI cards, charts, source footers)
- `src/types/` – TypeScript contracts for the dataset
- `data/raw/` – optional manually downloaded public source files (CSV/XLSX)
- `src/data/generated/` – generated JSON snapshots consumed by the frontend
- `scripts/` – one update entrypoint that generates snapshots
- `src/data/` – seeded section modules + `getDashboardDataset()` loader boundary
- `src/lib/insights/` – deterministic insight generation (no AI calls)
- `src/utils/format.ts` – number/date/unit formatting

## Data model

The UI consumes a single stable shape (`DashboardDataset`) and is loaded via one entrypoint:

- `src/data/getDashboardDataset.ts`

Seeded values live in section modules:

- `src/data/housing.ts`, `src/data/population.ts`, `src/data/economy.ts`, `src/data/safety.ts`

Generated snapshots (when present) live here:

- `src/data/generated/*.json`

Each section includes:

- `update` metadata (last updated, data-through date)
- `kpis` (cards)
- `series` (time series for charts)
- `charts` (chart specs)
- `sources` (publisher + links)

## Sources and credibility

This MVP includes representative sample values but keeps **source metadata** in place for every section.

### Live indicators (D3)

- Housing: **house prices** are backed by a generated snapshot from the UK House Price Index (Land Registry public data).
- Demographics: **population** is snapshot-backed via a manual ONS CSV import.
- Economy: **median annual earnings** is snapshot-backed via a manual ASHE CSV import.
- Safety, rents, and other indicators remain seeded for now.

As additional indicators are connected, the dashboard will remain "hybrid" until most metrics are live.

### Refreshing live snapshots

Install deps, then run:

```bash
cd bournemouth-insights
npm install
npm run data:update
```

The script will:

- download UKHPI CSV (or read `data/raw/ukhpi.csv` if you provide it)
- read manual CSV inputs for population and earnings (see below)
- generate JSON snapshots into `src/data/generated/`

To force a local raw file instead of downloading:

```bash
npm run data:update -- --ukhpi data/raw/ukhpi.csv
```

#### Manual CSV inputs (Population + Earnings)

To keep the app static-friendly and avoid fragile scraping, population and earnings currently use a **manual import** path.

Put these files in `bournemouth-insights/data/raw/`:

- `ons_population.csv`
- `ashe_earnings.csv`

Then run:

```bash
npm run data:update
```

Expected minimal CSV columns:

**Population (`data/raw/ons_population.csv`)**

- `areaCode` (e.g. `E06000058`)
- `year` (e.g. `2024`) or `date` (ISO like `2024-06-30`)
- `population` (number)

**Earnings (`data/raw/ashe_earnings.csv`)**

- `areaCode` (e.g. `E06000058`)
- `year` (e.g. `2025`) or `date` (ISO like `2025-12-31`)
- `medianAnnualEarningsGbp` (number)

The parser is forgiving about header names (e.g. `area_code`, `median_earnings`, or `value`), but the above are the preferred headers.

To set a stable generation date (useful for reproducible builds):

```bash
npm run data:update -- --generatedAt 2026-03-06
```

### Caveats

- UKHPI is monthly; the dashboard currently shows an annualised series (latest month within each calendar year).
- Population and earnings are snapshot-backed but depend on the quality of the manually downloaded CSV extract.
- Remaining indicators are still seeded and should not be treated as definitive official reporting.

As Phase 2 begins, add more real extracts from sources such as:

- ONS (population, rents, earnings)
- data.police.uk (crime)
- BCP Council (local housing supply metrics, local indicators)

## How to extend to real data later (Phase 2 direction)

1. Add additional snapshot generators (ONS/NOMIS datasets) into `scripts/update-data.ts`.
2. Keep publishing provenance into `src/data/generated/meta.json`.
3. When needed, move generation to a scheduled job (CI) and serve snapshots via static hosting or an API.
4. Keep UI unchanged by continuing to emit the same `DashboardDataset` shape.

## Phase 2 recommendations (clean next steps)

- Connect real sources: ONS, data.police.uk, NOMIS, BCP Council open data.
- Add a small ingestion + transform layer that outputs versioned `DashboardDataset` JSON.
- Add basic data QA: schema validation, missing-series checks, and change detection.
- Publish a simple read-only API (e.g., FastAPI) serving the dataset by area + version.
- Add per-chart source references (not just per section) where sources differ.
- Add deployment: Azure Static Web Apps (frontend) + scheduled refresh job (later).
- Add observability for refresh jobs (run logs, failures, dataset version timeline).

## Non-goals (Phase 1)

- No authentication, issue reporting, comments, or admin UI.
- No complex pipelines.
