import { CheckCircle2, CircleOff, Network, Wallet } from "lucide-react";
import { formatAddress, isSupportedChain } from "../services/walletService.js";

export function Profile({ wallet }) {
  const connected = wallet.connected;
  const supported = connected && isSupportedChain(wallet.chainId);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-web3-50 text-web3-700">
          <Wallet className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink-900">Wallet Profile</h2>
        <p className="mt-2 text-sm text-ink-500">
          Authentication is wallet-based. Firebase Authentication is not used.
        </p>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="grid gap-4">
          <ProfileRow
            icon={Wallet}
            label="Wallet Address"
            value={connected ? wallet.address : "Not connected"}
          />
          <ProfileRow
            icon={Network}
            label="Connected Network"
            value={connected ? `Chain ID ${wallet.chainId}` : "No network selected"}
          />
          <ProfileRow
            icon={supported ? CheckCircle2 : CircleOff}
            label="Account Status"
            value={connected ? (supported ? "Connected and supported" : "Unsupported network") : "Disconnected"}
          />
          <ProfileRow
            icon={Wallet}
            label="Wallet Provider"
            value={wallet.walletName || "MetaMask and Rabby supported"}
          />
        </div>
      </section>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-web3-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <p className="mt-1 break-all font-semibold text-ink-900">
          {label === "Wallet Address" && value.startsWith("0x") ? formatAddress(value) : value}
        </p>
      </div>
    </div>
  );
}
