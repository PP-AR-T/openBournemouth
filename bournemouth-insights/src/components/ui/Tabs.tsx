import type { ReactNode } from 'react'

export type TabSpec = {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({
  label,
  tabs,
  activeId,
  onChange,
}: {
  label: string
  tabs: TabSpec[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label={label}
        className="flex w-full flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1"
      >
        {tabs.map((t) => {
          const isActive = t.id === activeId
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'rounded-md px-3 py-2 text-xs font-semibold transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
              onClick={() => onChange(t.id)}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="motion-safe:animate-fade-in-up">
        {tabs.find((t) => t.id === activeId)?.content ?? null}
      </div>
    </div>
  )
}
