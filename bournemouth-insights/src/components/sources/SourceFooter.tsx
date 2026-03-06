import type { SourceMeta } from '@/types/dashboard'

export function SourceFooter({ sources }: { sources: SourceMeta[] }) {
  if (sources.length === 0) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      <div className="font-medium text-slate-900">Sources</div>
      <ul className="mt-2 space-y-1">
        {sources.map((s) => (
          <li key={`${s.publisher}-${s.name}`}>
            {s.url ? (
              <a className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500" href={s.url} target="_blank" rel="noreferrer">
                {s.publisher}: {s.name}
              </a>
            ) : (
              <span>
                {s.publisher}: {s.name}
              </span>
            )}
            <span className="text-slate-500"> · retrieved {s.retrievedAt}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
