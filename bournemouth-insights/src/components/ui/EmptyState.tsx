export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6">
      <div className="text-sm font-medium text-slate-900">{title}</div>
      {detail ? <div className="mt-1 text-sm text-slate-600">{detail}</div> : null}
    </div>
  )
}
