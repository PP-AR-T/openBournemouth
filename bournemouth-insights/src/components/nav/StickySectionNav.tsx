import { useEffect, useMemo, useState } from 'react'

export type SectionNavItem = {
  id: string
  label: string
}

function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))

        if (visible.length > 0) {
          const id = (visible[0]!.target as HTMLElement).id
          if (id) setActive(id)
        }
      },
      {
        root: null,
        // Favor the section currently near the top.
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.1, 0.2, 0.4, 0.6],
      },
    )

    for (const el of elements) obs.observe(el)

    return () => obs.disconnect()
  }, [ids])

  return active
}

export function StickySectionNav({ items }: { items: SectionNavItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items])
  const active = useActiveSection(ids)

  return (
    <div className="sticky top-2 z-20 -mx-1">
      <nav
        aria-label="Section navigation"
        className="mx-1 overflow-x-auto rounded-lg border border-slate-200 bg-white/95 px-2 py-2 backdrop-blur"
      >
        <div className="flex items-center gap-1">
          {items.map((item) => {
            const isActive = item.id === active
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  'shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
