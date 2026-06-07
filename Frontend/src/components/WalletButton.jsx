import { LogOut, Wallet } from "lucide-react";
import { formatAddress } from "../services/walletService.js";

export function WalletButton({ wallet, onConnect, onDisconnect, loading }) {
  if (wallet.connected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm">
          <p className="font-semibold text-ink-900">{formatAddress(wallet.address)}</p>
          <p className="text-xs text-ink-500">
            {wallet.walletName} · Chain {wallet.chainId || "-"}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:border-red-200 hover:text-red-700"
          onClick={onDisconnect}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-web3-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-web3-500 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        onClick={() => onConnect("metamask")}
        type="button"
      >
        <Wallet className="h-4 w-4" />
        {loading ? "Connecting..." : "MetaMask"}
      </button>
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-web3-500 hover:text-web3-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        onClick={() => onConnect("rabby")}
        type="button"
      >
        Rabby Wallet
      </button>
    </div>
  );
}
