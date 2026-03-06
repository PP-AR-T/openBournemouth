import { formatIsoDate } from '@/utils/format'

export function SectionHeader({
  title,
  description,
  lastUpdated,
}: {
  title: string
  description: string
  lastUpdated?: string
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-300 to-indigo-300" />
        </div>
        <p className="max-w-3xl text-sm text-slate-600">{description}</p>
      </div>

      {lastUpdated ? (
        <div className="text-xs text-slate-500">Last updated: {formatIsoDate(lastUpdated)}</div>
      ) : null}
    </div>
  )
}
