import type { TimeRange } from './timeRange'

export function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange
  onChange: (value: TimeRange) => void
}) {
  const items: Array<{ id: TimeRange; label: string }> = [
    { id: '5y', label: '5Y' },
    { id: '10y', label: '10Y' },
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
      {items.map((i) => {
        const isActive = i.id === value
        return (
          <button
            key={i.id}
            type="button"
            className={[
              'rounded px-2 py-1 text-[11px] font-semibold transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')}
            aria-pressed={isActive}
            onClick={() => onChange(i.id)}
          >
            {i.label}
          </button>
        )
      })}
    </div>
  )
}
