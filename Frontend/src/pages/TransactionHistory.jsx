import { transactions } from "../mock/transactions.js";
import { formatAddress } from "../services/walletService.js";

export function TransactionHistory() {
  return (
    <section className="rounded-xl border border-ink-100 bg-white shadow-soft">
      <div className="border-b border-ink-100 p-5">
        <p className="text-sm font-semibold text-web3-600">Transaction History</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Mock blockchain activity</h2>
        <p className="mt-2 text-sm text-ink-500">
          Twenty transaction records are available for demo and table layout testing.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {["Transaction Hash", "Action", "Wallet", "Timestamp"].map((header) => (
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink-500"
                  key={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {transactions.map((transaction) => (
              <tr className="hover:bg-ink-50/70" key={transaction.hash}>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink-900">
                  {transaction.hash.slice(0, 18)}...
                </td>
                <td className="px-4 py-3 text-sm text-ink-700">{transaction.action}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-500">
                  {formatAddress(transaction.wallet)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-500">
                  {transaction.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
