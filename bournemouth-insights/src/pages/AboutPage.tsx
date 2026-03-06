export function AboutPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">About</h2>
        <p className="max-w-3xl text-sm text-slate-600">
          Bournemouth Insights is an experimental personal project to present a small set of public
          indicators in a calm, neutral, evidence-led format.
        </p>
      </header>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Method (Phase 1)</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Data is stored locally as structured JSON with explicit source metadata.</li>
          <li>Charts and KPIs are generated deterministically from that dataset.</li>
          <li>Insights are rule-based statements that avoid over-claiming.</li>
        </ul>
      </section>
    </div>
  )
}
