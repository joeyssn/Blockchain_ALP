import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { products } from "../mock/products.js";

export function OwnershipTransfer() {
  const [productId, setProductId] = useState("PRD-1005");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleTransfer(event) {
    event.preventDefault();
    const product = products.find((item) => item.id === productId.trim());

    if (!product) {
      setError("Product ID not found in mock data.");
      setMessage("");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      setError("Enter a valid EVM wallet address that starts with 0x.");
      setMessage("");
      return;
    }

    setError("");
    setMessage(
      `Mock transfer prepared for ${product.name} to ${walletAddress}. The UI is ready for contract integration.`
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-web3-600">Ownership Transfer</p>
      <h2 className="mt-1 text-2xl font-bold text-ink-900">Transfer product ownership</h2>
      <p className="mt-2 text-sm text-ink-500">
        This mock flow validates inputs and shows the transaction state expected after a smart contract call.
      </p>

      <div className="mt-6 grid gap-4">
        <ErrorMessage message={error} onDismiss={() => setError("")} />
        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleTransfer}>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Product ID
          <input
            className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => setProductId(event.target.value)}
            value={productId}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          New Wallet Address
          <input
            className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder="0x..."
            value={walletAddress}
          />
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
          type="submit"
        >
          <ArrowLeftRight className="h-5 w-5" />
          Transfer Ownership
        </button>
      </form>
    </section>
  );
}
