import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import type { SourceMeta } from '@/types/dashboard'

export function ChartCard({
  title,
  subtitle,
  headerRight,
  sources,
  children,
}: {
  title: string
  subtitle?: string
  headerRight?: ReactNode
  sources?: SourceMeta[]
  children: ReactNode
}) {
  return (
    <Card className="group relative overflow-hidden p-4 motion-safe:animate-fade-in-up">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-100 to-indigo-100" />
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="text-xs text-slate-600">{subtitle}</div> : null}
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>

        <div className="h-60 w-full">{children}</div>

        {sources && sources.length > 0 ? (
          <div className="text-xs text-slate-600">
            <span className="font-medium text-slate-700">Source:</span>{' '}
            {sources.map((s, idx) => (
              <span key={`${s.publisher}-${s.name}`}>
                {idx > 0 ? <span className="px-2 text-slate-400">·</span> : null}
                {s.url ? (
                  <a
                    className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.publisher}
                  </a>
                ) : (
                  <span>{s.publisher}</span>
                )}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
