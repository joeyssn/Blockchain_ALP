export function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-web3-500 border-t-transparent" />
      {label}
    </div>
  );
}
