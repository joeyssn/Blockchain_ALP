import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message, onDismiss }) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button className="font-semibold text-red-800" onClick={onDismiss} type="button">
          Dismiss
        </button>
      )}
    </div>
  );
}
