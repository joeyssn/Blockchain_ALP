import { Network, UserCircle, Wallet } from "lucide-react";
import { formatAddress, isSupportedChain } from "../services/walletService.js";

export function Profile({ wallet }) {
  return (
    <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-web3-50 text-web3-700">
        <UserCircle className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink-900">Wallet Profile</h2>
      <p className="mt-2 text-sm text-ink-500">
        Authentication is wallet-based through MetaMask or Rabby Wallet. Firebase
        Authentication is not used.
      </p>

      <div className="mt-6 grid gap-3">
        <ProfileRow
          icon={Wallet}
          label="Wallet Address"
          value={wallet.connected ? wallet.address : "Not connected"}
        />
        <ProfileRow
          icon={Network}
          label="Connected Network"
          value={wallet.connected ? `Chain ID ${wallet.chainId}` : "No network selected"}
        />
        <ProfileRow
          icon={Wallet}
          label="Account Status"
          value={
            wallet.connected
              ? isSupportedChain(wallet.chainId)
                ? "Connected and supported"
                : "Unsupported network"
              : "Disconnected"
          }
        />
      </div>
    </section>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-web3-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <p className="mt-1 break-all font-semibold text-ink-900">
          {String(value).startsWith("0x") ? formatAddress(value) : value}
        </p>
      </div>
    </div>
  );
}
