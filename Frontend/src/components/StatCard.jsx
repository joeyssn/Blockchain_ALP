export function StatCard({ title, value, detail, icon: Icon, accent = "bg-web3-500" }) {
  return (
    <article className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-500">{title}</p>
          <strong className="mt-2 block text-3xl font-bold tracking-tight text-ink-900">
            {value}
          </strong>
        </div>
        {Icon && (
          <span className={`rounded-lg ${accent} p-3 text-white shadow-sm`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {detail && <p className="mt-4 text-sm text-ink-500">{detail}</p>}
    </article>
  );
}
