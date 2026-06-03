import {
  CheckCircle2,
  Database,
  Edit3,
  PackagePlus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  apiBaseUrl,
  checkBackendHealth,
  createMetadata,
  deleteMetadata,
  getMetadata,
  listMetadata,
  updateMetadata,
} from "./services/productApi.js";

const emptyForm = {
  productCode: "",
  blockchainProductId: "",
  productName: "",
  category: "",
  brand: "",
  imageUrl: "",
  description: "",
  sellerName: "",
  sellerWallet: "",
  sellerContact: "",
};

function toPayload(form) {
  return {
    productCode: form.productCode.trim(),
    blockchainProductId: Number(form.blockchainProductId || 1),
    productName: form.productName.trim(),
    category: form.category.trim(),
    brand: form.brand.trim(),
    imageUrl: form.imageUrl.trim(),
    description: form.description.trim(),
    seller: {
      name: form.sellerName.trim(),
      walletAddress: form.sellerWallet.trim(),
      contact: form.sellerContact.trim(),
    },
  };
}

function toForm(product) {
  return {
    productCode: product.productCode || "",
    blockchainProductId: product.blockchainProductId || "",
    productName: product.productName || "",
    category: product.category || "",
    brand: product.brand || "",
    imageUrl: product.imageUrl || "",
    description: product.description || "",
    sellerName: product.seller?.name || "",
    sellerWallet: product.seller?.walletAddress || "",
    sellerContact: product.seller?.contact || "",
  };
}

export function App() {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingCode, setEditingCode] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);
  const [message, setMessage] = useState("Checking backend connection...");

  const mode = editingCode ? "Update Product" : "Register Product";

  const totalProducts = products.length;
  const latestProduct = useMemo(() => products[0], [products]);

  async function run(label, action) {
    try {
      setMessage(`${label}...`);
      await action();
      setMessage(`${label} complete`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function refreshProducts() {
    const data = await listMetadata();
    setProducts(data);
  }

  async function checkConnection() {
    try {
      await checkBackendHealth();
      setBackendOnline(true);
      setMessage("Backend connected");
      await refreshProducts();
    } catch (error) {
      setBackendOnline(false);
      setMessage(`Backend offline: ${error.message}`);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    await run(mode, async () => {
      if (editingCode) {
        await updateMetadata(editingCode, toPayload(form));
      } else {
        await createMetadata(toPayload(form));
      }

      setForm(emptyForm);
      setEditingCode("");
      await refreshProducts();
    });
  }

  async function handleSearch(event) {
    event.preventDefault();

    await run("Searching product", async () => {
      const product = await getMetadata(searchCode.trim());
      setSelectedProduct(product);
    });
  }

  async function handleDelete(productCode) {
    await run("Deleting product", async () => {
      await deleteMetadata(productCode);

      if (selectedProduct?.productCode === productCode) {
        setSelectedProduct(null);
      }

      if (editingCode === productCode) {
        setEditingCode("");
        setForm(emptyForm);
      }

      await refreshProducts();
    });
  }

  function handleEdit(product) {
    setEditingCode(product.productCode);
    setForm(toForm(product));
    setMessage(`Editing ${product.productCode}`);
  }

  function handleCancelEdit() {
    setEditingCode("");
    setForm(emptyForm);
    setMessage("Edit cancelled");
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Backend connected demo</p>
          <h1>Product Authenticity Verification</h1>
          <p className="subtitle">
            Simple product metadata frontend connected to the Express backend.
          </p>
        </div>
        <div className={backendOnline ? "connection online" : "connection offline"}>
          <span></span>
          {backendOnline ? "Backend online" : "Backend offline"}
        </div>
      </header>

      <section className="status-row">
        <div>
          <strong>{message}</strong>
          <small>API: {apiBaseUrl}</small>
        </div>
        <button onClick={() => run("Refreshing products", refreshProducts)}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section className="stats">
        <div>
          <span>{totalProducts}</span>
          <p>Products stored in backend</p>
        </div>
        <div>
          <span>{latestProduct?.productCode || "-"}</span>
          <p>Latest product code</p>
        </div>
        <div>
          <span>{backendOnline ? "OK" : "OFF"}</span>
          <p>Backend connection</p>
        </div>
      </section>

      <section className="grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-title">
            <PackagePlus size={20} />
            <h2>{mode}</h2>
          </div>

          <div className="form-grid">
            <label>
              Product Code
              <input
                required
                disabled={Boolean(editingCode)}
                value={form.productCode}
                onChange={(event) =>
                  setForm({ ...form, productCode: event.target.value })
                }
              />
            </label>
            <label>
              Blockchain Product ID
              <input
                required
                min="1"
                type="number"
                value={form.blockchainProductId}
                onChange={(event) =>
                  setForm({ ...form, blockchainProductId: event.target.value })
                }
              />
            </label>
            <label className="wide">
              Product Name
              <input
                required
                value={form.productName}
                onChange={(event) =>
                  setForm({ ...form, productName: event.target.value })
                }
              />
            </label>
            <label>
              Category
              <input
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              />
            </label>
            <label>
              Brand
              <input
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
              />
            </label>
            <label className="wide">
              Image URL
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm({ ...form, imageUrl: event.target.value })
                }
              />
            </label>
            <label className="wide">
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <label>
              Seller Name
              <input
                value={form.sellerName}
                onChange={(event) =>
                  setForm({ ...form, sellerName: event.target.value })
                }
              />
            </label>
            <label>
              Seller Wallet
              <input
                value={form.sellerWallet}
                onChange={(event) =>
                  setForm({ ...form, sellerWallet: event.target.value })
                }
              />
            </label>
            <label className="wide">
              Seller Contact
              <input
                value={form.sellerContact}
                onChange={(event) =>
                  setForm({ ...form, sellerContact: event.target.value })
                }
              />
            </label>
          </div>

          <div className="actions">
            <button className="primary" type="submit">
              <CheckCircle2 size={18} />
              {mode}
            </button>
            {editingCode && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <aside className="panel">
          <div className="panel-title">
            <Search size={20} />
            <h2>Find Product</h2>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              required
              placeholder="Example: PRD-001"
              value={searchCode}
              onChange={(event) => setSearchCode(event.target.value)}
            />
            <button className="primary" type="submit">
              Search
            </button>
          </form>

          {selectedProduct && (
            <div className="product-card">
              {selectedProduct.imageUrl && (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} />
              )}
              <h3>{selectedProduct.productName}</h3>
              <p>{selectedProduct.description || "No description"}</p>
              <dl>
                <dt>Code</dt>
                <dd>{selectedProduct.productCode}</dd>
                <dt>Category</dt>
                <dd>{selectedProduct.category || "-"}</dd>
                <dt>Brand</dt>
                <dd>{selectedProduct.brand || "-"}</dd>
                <dt>Seller</dt>
                <dd>{selectedProduct.seller?.name || "-"}</dd>
              </dl>
            </div>
          )}
        </aside>
      </section>

      <section className="panel table-panel">
        <div className="panel-title">
          <Database size={20} />
          <h2>Products From Backend</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productCode}>
                  <td>{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td>{product.category || "-"}</td>
                  <td>{product.brand || "-"}</td>
                  <td>{product.seller?.name || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => handleEdit(product)} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleDelete(product.productCode)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="empty" colSpan="6">
                    No products yet. Add one from the form above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
