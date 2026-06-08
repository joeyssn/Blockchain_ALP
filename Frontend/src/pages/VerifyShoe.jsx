import { Search, ShieldCheck, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { mockShoes } from "../mock/shoes.js";
import { getShoeMetadata } from "../services/shoeApi.js";
import {
  createShoeContract,
  hasContractAddress,
  normalizeShoe,
} from "../services/shoeContract.js";
import { formatAddress } from "../services/walletService.js";

export function VerifyShoe({ wallet }) {
  const [params] = useSearchParams();
  const initialCode = params.get("code") || "NIKE001";
  const [productCode, setProductCode] = useState(initialCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sampleCodes = useMemo(() => mockShoes.map((shoe) => shoe.product_code), []);

  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const code = productCode.trim().toUpperCase();
      let chainResult = null;
      let metadata = null;
      let dataSource = "backend";

      if (hasContractAddress()) {
        const contract = createShoeContract(wallet.address || undefined);
        if (wallet.connected) {
          await contract.write.verifyShoe([code], { account: wallet.address });
        }

        let shoe = null;
        try {
          shoe = normalizeShoe(await contract.read.getShoe([code]));
        } catch {
          shoe = null;
        }

        const authentic = Boolean(shoe?.authentic);
        chainResult = { authentic, shoe };
      } else {
        const mockShoe = mockShoes.find((shoe) => shoe.product_code === code);
        chainResult = {
          authentic: Boolean(mockShoe),
          shoe: mockShoe
            ? {
                productCode: mockShoe.product_code,
                brand: mockShoe.brand,
                model: mockShoe.model,
                releaseYear: mockShoe.release_year,
                companyWallet: mockShoe.company_wallet,
                authentic: true,
              }
            : null,
        };
        dataSource = "mock";
      }

      try {
        metadata = await getShoeMetadata(code);
      } catch {
        const mockShoe = mockShoes.find((shoe) => shoe.product_code === code);
        metadata = {
          productCode: code,
          metadataFound: Boolean(mockShoe),
          shoe: mockShoe || null,
        };
        dataSource = "mock";
      }

      setResult({
        productCode: code,
        authentic: Boolean(chainResult.authentic),
        chainShoe: chainResult.shoe,
        metadata,
        dataSource,
      });
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setLoading(false);
    }
  }

  const shoe = result?.metadata?.shoe;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">User Verification</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Verify shoe authenticity</h2>
        <p className="mt-2 text-sm text-ink-500">
          Enter a product code. The smart contract is the source of truth, while
          the backend provides supporting shoe details.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleVerify}>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Product Code
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 uppercase outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setProductCode(event.target.value)}
              placeholder="NIKE001"
              value={productCode}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? <LoadingSpinner label="Verifying" /> : <Search className="h-5 w-5" />}
            Verify
          </button>
        </form>

        <div className="mt-5">
          <p className="text-sm font-semibold text-ink-700">Sample codes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleCodes.map((code) => (
              <button
                className="rounded-full border border-ink-200 px-3 py-1 text-sm text-ink-600 hover:border-web3-500"
                key={code}
                onClick={() => setProductCode(code)}
                type="button"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <ErrorMessage message={error} onDismiss={() => setError("")} />

        {!result && !error && (
          <div className="rounded-xl bg-ink-50 p-6 text-sm text-ink-500">
            Verification results will appear here.
          </div>
        )}

        {result && (
          <div className="grid gap-5">
            <div
              className={`flex items-center gap-3 rounded-xl p-4 ${
                result.authentic ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}
            >
              {result.authentic ? (
                <ShieldCheck className="h-8 w-8" />
              ) : (
                <ShieldX className="h-8 w-8" />
              )}
              <div>
                <p className="text-sm font-semibold">Verification Result</p>
                <h3 className="text-xl font-bold">
                  {result.authentic
                    ? "Authentic Product"
                    : "Product may be counterfeit or unregistered"}
                </h3>
                <p className="text-sm">Data source: {result.dataSource}</p>
              </div>
            </div>

            {shoe && (
              <dl className="grid gap-3 rounded-xl bg-ink-50 p-4 text-sm">
                <Detail label="Product Code" value={shoe.product_code} />
                <Detail label="Brand" value={shoe.brand} />
                <Detail label="Model" value={shoe.model} />
                <Detail label="Release Year" value={shoe.release_year} />
                <Detail label="Registered By" value={formatAddress(shoe.company_wallet)} />
                <Detail label="Description" value={shoe.description || "-"} />
                <Detail label="Specifications" value={shoe.specifications || "-"} />
              </dl>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="grid gap-1 md:grid-cols-[10rem_1fr]">
      <dt className="font-semibold text-ink-500">{label}</dt>
      <dd className="break-words font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
