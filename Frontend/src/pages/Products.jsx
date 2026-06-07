import { useState } from "react";
import { ProductTable } from "../components/ProductTable.jsx";
import { products } from "../mock/products.js";
import { formatAddress } from "../services/walletService.js";

export function Products() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  return (
    <div className="grid gap-6">
      <ProductTable onView={setSelectedProduct} products={products} />

      {selectedProduct && (
        <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-web3-600">Product Details</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold text-ink-900">{selectedProduct.name}</h2>
              <p className="mt-2 text-ink-500">{selectedProduct.description}</p>
            </div>
            <dl className="grid gap-3 rounded-xl bg-ink-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Product ID</dt>
                <dd className="font-semibold text-ink-900">{selectedProduct.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Serial Number</dt>
                <dd className="font-semibold text-ink-900">{selectedProduct.serialNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Owner</dt>
                <dd className="font-semibold text-ink-900">{formatAddress(selectedProduct.owner)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Status</dt>
                <dd className="font-semibold text-ink-900">{selectedProduct.status}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}
    </div>
  );
}
