import { LogOut, Wallet } from "lucide-react";
import { roleLabels } from "../config/roles";
import { useAuth } from "../context/AuthContext";
import { formatAddress } from "../services/walletService.js";

export function WalletButton() {
  const { companyName, disconnectWallet, isConnecting, role, wallet, walletAddress } = useAuth();

  if (walletAddress) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm">
          <p className="font-semibold text-ink-900">{formatAddress(walletAddress)}</p>
          <p className="text-xs text-ink-500">
            {companyName || roleLabels[role]} {wallet.chainId ? `- Chain ${wallet.chainId}` : ""}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 hover:border-red-200 hover:text-red-700"
          onClick={disconnectWallet}
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
      <span className="inline-flex items-center gap-2 rounded-lg bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-500">
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Disconnected"}
      </span>
    </div>
  );
}
