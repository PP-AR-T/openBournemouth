import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { KPIGrid } from '@/components/kpi/KPIGrid'
import { SectionBlock } from '@/components/layout/SectionBlock'
import { LoadingState } from '@/components/ui/LoadingState'
import { getDashboardDataset } from '@/data/getDashboardDataset'
import type { DashboardDataset } from '@/types/dashboard'
import { formatIsoDate } from '@/utils/format'

function formatModeLabel(mode: DashboardDataset['dataStatus']['mode']): string {
  if (mode === 'live') return 'Live (from public sources)'
  if (mode === 'hybrid') return 'Hybrid (some live indicators, some seeded)'
  return 'Sample/seeded (Phase 1)'
}

export function OverviewPage() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null)

  const kpiHrefForId = useMemo(() => {
    const map: Record<string, string> = {
      pop_latest: '/population',
      house_price_latest: '/housing',
      rent_latest: '/housing',
      employment_rate: '/economy',
    }
    return (id: string) => map[id]
  }, [])

  useEffect(() => {
    void getDashboardDataset().then(setDataset)
  }, [])

  if (!dataset) return <LoadingState label="Loading overview…" />

  const topNarrative =
    'Bournemouth Insights is an experimental public-data dashboard designed to make common indicators easier to find and interpret. It is not an official reporting service; it aims to support transparency and accessibility by showing sources, dates, and cautious summaries.'

  const transparencyNote =
    'Sources and dates are shown for transparency. Definitions, coverage and update frequency can vary by source.'

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Highlights</div>
        <KPIGrid items={dataset.overview.summaryKpis} hrefForId={kpiHrefForId} />
      </div>

      <SectionBlock
        id="overview"
        title={dataset.overview.headline}
        description={dataset.overview.intro}
        lastUpdated={dataset.overview.lastUpdated}
        lead={
          <div className="space-y-3">
            <p className="text-sm text-slate-700">{topNarrative}</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <div className="font-medium text-slate-900">Data status</div>
              <div className="mt-1 space-y-1">
                <div>
                  <span className="font-medium">Data mode:</span> {formatModeLabel(dataset.dataStatus.mode)}
                </div>
                <div>
                  <span className="font-medium">Last refresh:</span> {formatIsoDate(dataset.dataStatus.lastRefreshAt)}
                </div>
                <div>
                  <span className="font-medium">Coverage note:</span> {dataset.dataStatus.coverageNote}
                </div>
                {dataset.dataStatus.liveIndicators && dataset.dataStatus.liveIndicators.length > 0 ? (
                  <div>
                    <span className="font-medium">Snapshot-backed:</span>{' '}
                    {dataset.dataStatus.liveIndicators.map((x, idx) => (
                      <span key={`${x.sectionId}-${x.indicatorId}`}>
                        {idx > 0 ? <span className="px-2 text-slate-300">·</span> : null}
                        <span className="text-slate-800">{x.label}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-slate-600">
                {transparencyNote}{' '}
                <Link
                  to="/methodology"
                  className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Methodology & definitions
                </Link>
                .
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/housing"
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">Housing</div>
                <div className="mt-1 text-xs text-slate-600">Prices, rents and affordability signals</div>
              </Link>
              <Link
                to="/population"
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">Population</div>
                <div className="mt-1 text-xs text-slate-600">Population trend and age structure</div>
              </Link>
              <Link
                to="/economy"
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">Economy</div>
                <div className="mt-1 text-xs text-slate-600">Jobs, earnings and employment</div>
              </Link>
              <Link
                to="/safety"
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">Safety</div>
                <div className="mt-1 text-xs text-slate-600">Crime indicators and category snapshot</div>
              </Link>
              <Link
                to="/insights"
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">Insights</div>
                <div className="mt-1 text-xs text-slate-600">Short data briefs generated from the dataset</div>
              </Link>
            </div>
          </div>
        }
      >
        <></>
      </SectionBlock>
    </div>
  )
}
