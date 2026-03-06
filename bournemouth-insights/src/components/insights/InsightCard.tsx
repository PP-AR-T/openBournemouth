import { useId, useState } from 'react'
import type { Insight } from '@/types/dashboard'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false)
  const contentId = useId()

  return (
    <Card className="group relative overflow-hidden p-4 motion-safe:animate-fade-in-up">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-100 to-indigo-100" />
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {insight.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
          {insight.periodLabel ? (
            <span className="text-xs text-slate-500">{insight.periodLabel}</span>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-slate-800">{insight.statement}</p>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {insight.evidence ? (open ? 'Evidence shown' : 'Evidence hidden') : 'No evidence note'}
          </div>
          {insight.evidence ? (
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Less' : 'Details'}
            </button>
          ) : null}
        </div>

        {insight.evidence ? (
          <div
            id={contentId}
            className={[
              'overflow-hidden text-xs text-slate-500 transition-[max-height,opacity] duration-300 motion-safe:duration-300',
              open ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0',
            ].join(' ')}
          >
            <div className="pt-1">Evidence: {insight.evidence}</div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
