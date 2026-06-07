import { Inbox } from "lucide-react";

export function EmptyState({ title = "No data found", description }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center">
      <Inbox className="mx-auto h-10 w-10 text-ink-500" />
      <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
