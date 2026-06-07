import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "./EmptyState.jsx";

const pageSize = 5;

function statusClass(status) {
  if (status === "Verified") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Flagged") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ProductTable({ products, onView }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return products;
    }

    return products.filter((product) =>
      [product.id, product.name, product.owner, product.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="rounded-xl border border-ink-100 bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Products</h2>
          <p className="text-sm text-ink-500">Search and inspect registered product records.</p>
        </div>
        <input
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20 sm:w-72"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          value={query}
        />
      </div>

      {visibleProducts.length === 0 ? (
        <div className="p-4">
          <EmptyState
            description="Try a different product ID, owner wallet, or status."
            title="No matching products"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100">
            <thead className="bg-ink-50">
              <tr>
                {["Product ID", "Product Name", "Owner", "Status", "Created Date", "Action"].map(
                  (header) => (
                    <th
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-ink-500"
                      key={header}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {visibleProducts.map((product) => (
                <tr className="hover:bg-ink-50/70" key={product.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink-900">
                    {product.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-700">{product.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-500">
                    {shortAddress(product.owner)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-500">
                    {product.createdDate}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:border-web3-500 hover:text-web3-700"
                      onClick={() => onView(product)}
                      type="button"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 p-4 text-sm text-ink-500">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-ink-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg border border-ink-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
