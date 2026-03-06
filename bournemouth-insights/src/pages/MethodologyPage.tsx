import { Card } from '@/components/ui/Card'
import { sectionConfigs } from '@/config/sections'

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
}

export function MethodologyPage() {
  const sections = sectionConfigs.filter((s) => s.id !== 'overview' && s.id !== 'insights')

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Methodology & definitions
        </h2>
        <p className="max-w-3xl text-sm text-slate-600">
          This page explains what the dashboard represents, how to interpret it, and where the data
          comes from. It is written for clarity rather than technical detail.
        </p>
      </header>

      <Card className="p-4">
        <div className="space-y-2">
          <SectionTitle title="What this dashboard is" />
          <p className="text-sm text-slate-700">
            Bournemouth Insights is an experimental public-data dashboard intended to make common
            local indicators easier to find and interpret. It aims to support transparency and
            clarity.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <SectionTitle title="What it is not" />
          <p className="text-sm text-slate-700">
            It is not definitive official reporting. Figures may be partial, simplified, or
            presented at a different cadence than primary publications.
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <SectionTitle title="Phase 1 data (sample / seeded / partial)" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Phase 1 includes sample/seeded values while a robust ingestion pipeline is built.
            </li>
            <li>
              Where possible, each chart shows a chart-specific source note. Section footers list
              the sources that section draws from.
            </li>
            <li>
              The “Data status” block at the top of the dashboard summarises how current the dataset
              is and what it covers.
            </li>
          </ul>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <SectionTitle title="Definitions and caveats" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Definitions can vary across sources (for example, what counts as “recorded crime” or
              how “earnings” is measured).
            </li>
            <li>
              Update frequency differs by source (monthly vs quarterly vs annual), so different
              charts may cover different periods.
            </li>
            <li>
              Where an indicator is a proxy (a simplified stand-in), this is noted in the section
              description.
            </li>
          </ul>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-3">
          <SectionTitle title="What each section represents" />
          <div className="space-y-3">
            {sections.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                <div className="text-sm text-slate-700">{s.description}</div>
              </div>
            ))}
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">Short insights</div>
              <div className="text-sm text-slate-700">
                A small set of cautious, deterministic observations generated from the visible
                series. These are intended to help scanning, not to replace primary data.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <SectionTitle title="Future live data (Phase 2)" />
          <p className="text-sm text-slate-700">
            Later phases will replace sample values with live public datasets. The goal is to
            refresh data on an explicit cadence, retain provenance (source + retrieval date), and
            keep the presentation neutral and comparable over time.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Metric definitions and units will be documented alongside each chart.</li>
            <li>Source notes will include dataset identifiers and any known caveats.</li>
            <li>Update cadence will be published (and reflected in the Data status block).</li>
            <li>
              Area coverage (codes/levels) will be made explicit to support multi-area comparisons.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
