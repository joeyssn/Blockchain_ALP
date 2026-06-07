import { Activity, Boxes, ShieldCheck, Wallet } from "lucide-react";
import { products } from "../mock/products.js";
import { transactions } from "../mock/transactions.js";
import { formatAddress } from "../services/walletService.js";
import { StatCard } from "../components/StatCard.jsx";

export function Dashboard({ wallet }) {
  const verifiedProducts = products.filter((product) => product.status === "Verified");
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-ink-900 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold text-web3-400">Web3 Verification Console</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Demo-ready product authenticity dashboard</h2>
            <p className="mt-2 max-w-2xl text-ink-200">
              Connect MetaMask or Rabby Wallet, browse mock products, verify product IDs,
              and simulate transfers while smart contract integration is prepared.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-200">Connected Wallet</p>
            <p className="mt-1 font-semibold">
              {wallet.connected ? formatAddress(wallet.address) : "Not connected"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="Mock records available for demos"
          icon={Boxes}
          title="Total Products"
          value={products.length}
        />
        <StatCard
          accent="bg-emerald-500"
          detail="Products marked as authentic"
          icon={ShieldCheck}
          title="Verified Products"
          value={verifiedProducts.length}
        />
        <StatCard
          accent="bg-sky-500"
          detail="Recent mock chain events"
          icon={Activity}
          title="Transactions"
          value={transactions.length}
        />
        <StatCard
          accent="bg-violet-500"
          detail={wallet.walletName || "MetaMask / Rabby supported"}
          icon={Wallet}
          title="Wallet Status"
          value={wallet.connected ? "Connected" : "Disconnected"}
        />
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Recent Transactions</h2>
            <p className="text-sm text-ink-500">Latest mock blockchain activity.</p>
          </div>
        </div>
        <div className="grid gap-3">
          {recentTransactions.map((transaction) => (
            <article
              className="grid gap-2 rounded-lg border border-ink-100 p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
              key={transaction.hash}
            >
              <div>
                <p className="font-semibold text-ink-900">{transaction.action}</p>
                <p className="text-xs text-ink-500">{transaction.hash.slice(0, 18)}...</p>
              </div>
              <p className="text-sm text-ink-500">{formatAddress(transaction.wallet)}</p>
              <p className="text-sm font-medium text-ink-700">{transaction.timestamp}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
