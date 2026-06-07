import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { products } from "../mock/products.js";
import { formatAddress } from "../services/walletService.js";

export function VerifyProduct() {
  const [productId, setProductId] = useState("PRD-1001");
  const [result, setResult] = useState(products[0]);
  const [error, setError] = useState("");

  function handleVerify(event) {
    event.preventDefault();
    const product = products.find(
      (item) => item.id.toLowerCase() === productId.trim().toLowerCase()
    );

    if (!product) {
      setResult(null);
      setError("Product not found in mock data. Try PRD-1001 through PRD-1010.");
      return;
    }

    setError("");
    setResult(product);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Verify Product</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Check blockchain authenticity</h2>
        <p className="mt-2 text-sm text-ink-500">
          Use a mock product ID to preview the verification result layout.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleVerify}>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Product ID
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setProductId(event.target.value)}
              placeholder="PRD-1001"
              value={productId}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
            type="submit"
          >
            <Search className="h-5 w-5" />
            Verify
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <ErrorMessage message={error} onDismiss={() => setError("")} />
        {result && (
          <div className="grid gap-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-ink-500">Verification Result</p>
                <h3 className="text-xl font-bold text-ink-900">
                  {result.status === "Flagged" ? "Review Required" : "Product record found"}
                </h3>
              </div>
            </div>

            <dl className="grid gap-3 rounded-xl bg-ink-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Product</dt>
                <dd className="font-semibold text-ink-900">{result.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Current Owner</dt>
                <dd className="font-semibold text-ink-900">{formatAddress(result.owner)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Manufacturer</dt>
                <dd className="font-semibold text-ink-900">{result.manufacturer}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Blockchain Status</dt>
                <dd className="font-semibold text-ink-900">{result.status}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
