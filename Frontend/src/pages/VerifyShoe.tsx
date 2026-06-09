import { Search, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import {
  formatRegistrationDate,
  searchShoes,
  useRegisteredShoes,
} from "../services/shoeService";

export function VerifyShoe() {
  const { error, loading, shoes: allShoes } = useRegisteredShoes();
  const [params] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [selectedShoe, setSelectedShoe] = useState<any>(null);

  const results = useMemo(
    () => searchShoes(submittedQuery, allShoes),
    [allShoes, submittedQuery]
  );

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  function startVerification(shoe: any) {
    console.log("[VERIFY] Product Found", {
      shoeCode: shoe.shoeCode,
      shoeName: shoe.shoeName,
      companyName: shoe.companyName,
    });
    setSelectedShoe(shoe);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Verify Shoe</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Search registered shoes</h2>
        <p className="mt-2 text-sm text-ink-500">
          Search by shoe code, shoe name, or company name. Newly registered company shoes appear here
          immediately from the shared shoe repository.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Shoe Code, Shoe Name, or Company Name
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="NK-001, Air Jordan 1, Nike"
              value={query}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-5 py-3 font-semibold text-white hover:bg-web3-500 md:mt-7"
            type="submit"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
        <ErrorMessage message={error} onDismiss={() => undefined} />
        {loading && <LoadingSpinner label="Loading shoes" />}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h3 className="text-lg font-bold text-ink-900">Verification Results</h3>
          <p className="text-sm text-ink-500">
            {results.length} {results.length === 1 ? "shoe" : "shoes"} found
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No shoes found"
              description="Try searching by another shoe name or company."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((shoe) => (
              <article className="rounded-lg border border-ink-100 p-4" key={shoe.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink-900">{shoe.shoeName}</p>
                    <p className="mt-1 text-sm font-semibold text-web3-700">
                      {shoe.companyName}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase text-ink-500">
                      {shoe.shoeCode}
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                </div>
                <p className="mt-3 text-sm text-ink-500">{shoe.description}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <ResultDetail label="Verification Status" value={shoe.verificationStatus} />
                  <ResultDetail
                    label="Registration Date"
                    value={`Registered on ${formatRegistrationDate(shoe.createdAt)}`}
                  />
                </div>
                <button
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-web3-500 disabled:opacity-60"
                  onClick={() => startVerification(shoe)}
                  type="button"
                >
                  Verify Shoe
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedShoe && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 p-4">
          <section className="w-full max-w-lg rounded-xl bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-web3-600">Verification Result</p>
            <h3 className="mt-1 text-xl font-bold text-ink-900">{selectedShoe.shoeName}</h3>
            <div className="mt-4 grid gap-3 rounded-lg bg-ink-50 p-4 text-sm">
              <ResultDetail label="Shoe Code" value={selectedShoe.shoeCode} />
              <ResultDetail label="Company" value={selectedShoe.companyName} />
              <ResultDetail label="Status" value={selectedShoe.verificationStatus} />
              <ResultDetail
                label="Registration Date"
                value={formatRegistrationDate(selectedShoe.createdAt)}
              />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-lg border border-ink-200 px-4 py-2 font-semibold text-ink-700 hover:border-ink-300"
                onClick={() => setSelectedShoe(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ResultDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3 py-2">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}
