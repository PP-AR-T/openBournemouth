export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="text-sm text-slate-700">{label ?? 'Loading…'}</div>
    </div>
  )
}
