import {
  CheckCircle2,
  Database,
  List,
  PackagePlus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createProductContract,
  normalizeProduct,
  requestWalletAccount,
} from "./services/contract.js";
import {
  createMetadata,
  deleteMetadata,
  getMetadata,
  listMetadata,
  updateMetadata,
} from "./services/productApi.js";

const initialRegisterForm = {
  productCode: "",
  productName: "",
  productOwner: "",
  description: "",
  imageUrl: "",
  category: "",
  brand: "",
  sellerName: "",
  sellerWallet: "",
  sellerContact: "",
};

const initialUpdateForm = {
  id: "",
  productCode: "",
  productName: "",
  authentic: true,
  description: "",
  imageUrl: "",
  category: "",
  brand: "",
  sellerName: "",
  sellerWallet: "",
  sellerContact: "",
};

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function metadataPayload(form, blockchainProductId) {
  return {
    productCode: form.productCode,
    blockchainProductId: Number(blockchainProductId),
    productName: form.productName,
    description: form.description,
    imageUrl: form.imageUrl,
    category: form.category,
    brand: form.brand,
    seller: {
      name: form.sellerName,
      walletAddress: form.sellerWallet,
      contact: form.sellerContact,
    },
  };
}

export function App() {
  const [account, setAccount] = useState("");
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);
  const [verifyCode, setVerifyCode] = useState("");
  const [detailId, setDetailId] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [removeCode, setRemoveCode] = useState("");
  const [transferId, setTransferId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [verification, setVerification] = useState(null);
  const [status, setStatus] = useState("Ready");

  const contract = useMemo(() => {
    try {
      return createProductContract(account || undefined);
    } catch {
      return null;
    }
  }, [account]);

  async function run(label, action) {
    try {
      setStatus(`${label}...`);
      await action();
      setStatus(`${label} complete`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function connectWallet() {
    await run("Connecting wallet", async () => {
      setAccount(await requestWalletAccount());
    });
  }

  async function loadAllProducts() {
    if (!contract) {
      throw new Error("Connect wallet and configure contract address");
    }

    const chainProducts = await contract.read.getAllProducts();
    setProducts(chainProducts.map(normalizeProduct));
    setMetadata(await listMetadata());
  }

  async function registerProduct(event) {
    event.preventDefault();

    await run("Registering product", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      await contract.write.registerProduct([
        registerForm.productCode,
        registerForm.productName,
        registerForm.productOwner,
      ]);

      const allProducts = (await contract.read.getAllProducts()).map(normalizeProduct);
      const createdProduct = allProducts.find(
        (product) => product.productCode === registerForm.productCode
      );

      if (!createdProduct) {
        throw new Error("Product registered, but product id was not found");
      }

      await createMetadata(metadataPayload(registerForm, createdProduct.id));
      setRegisterForm(initialRegisterForm);
      await loadAllProducts();
    });
  }

  async function verifyProduct(event) {
    event.preventDefault();

    await run("Verifying product", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      const authentic = await contract.read.verifyProduct([verifyCode]);
      let offChainMetadata = null;

      try {
        offChainMetadata = await getMetadata(verifyCode);
      } catch {
        offChainMetadata = null;
      }

      setVerification({
        productCode: verifyCode,
        authentic,
        metadata: offChainMetadata,
      });
    });
  }

  async function loadProductDetails(event) {
    event.preventDefault();

    await run("Loading product", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      const product = normalizeProduct(await contract.read.getProduct([BigInt(detailId)]));
      let productMetadata = null;

      try {
        productMetadata = await getMetadata(product.productCode);
      } catch {
        productMetadata = null;
      }

      setSelectedProduct({ ...product, metadata: productMetadata });
    });
  }

  async function updateProduct(event) {
    event.preventDefault();

    await run("Updating product", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      await contract.write.updateProduct([
        BigInt(updateForm.id),
        updateForm.productName,
        updateForm.authentic,
      ]);
      await updateMetadata(
        updateForm.productCode,
        metadataPayload(updateForm, updateForm.id)
      );
      setUpdateForm(initialUpdateForm);
      await loadAllProducts();
    });
  }

  async function removeProduct(event) {
    event.preventDefault();

    await run("Removing product", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      await contract.write.removeProduct([BigInt(removeId)]);

      if (removeCode) {
        await deleteMetadata(removeCode);
      }

      setRemoveId("");
      setRemoveCode("");
      await loadAllProducts();
    });
  }

  async function transferOwnership(event) {
    event.preventDefault();

    await run("Transferring ownership", async () => {
      if (!contract) {
        throw new Error("Connect wallet and configure contract address");
      }

      await contract.write.transferOwnership([BigInt(transferId), newOwner]);
      setTransferId("");
      setNewOwner("");
      await loadAllProducts();
    });
  }

  function fillUpdate(product) {
    const meta = metadata.find((item) => item.productCode === product.productCode);

    setUpdateForm({
      id: product.id,
      productCode: product.productCode,
      productName: product.productName,
      authentic: product.authentic,
      description: meta?.description || "",
      imageUrl: meta?.imageUrl || "",
      category: meta?.category || "",
      brand: meta?.brand || "",
      sellerName: meta?.seller?.name || "",
      sellerWallet: meta?.seller?.walletAddress || "",
      sellerContact: meta?.seller?.contact || "",
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Product Authenticity Verification</h1>
          <p>Smart contract authenticity with off-chain product metadata</p>
        </div>
        <button className="primary-button" onClick={connectWallet} title="Connect wallet">
          <Wallet size={18} />
          {account ? shortAddress(account) : "Connect"}
        </button>
      </header>

      <section className="status-bar">
        <span>{status}</span>
        <button onClick={() => run("Refreshing products", loadAllProducts)} title="Refresh products">
          <RefreshCw size={16} />
        </button>
      </section>

      <section className="workspace-grid">
        <form className="panel register-panel" onSubmit={registerProduct}>
          <div className="panel-heading">
            <PackagePlus size={20} />
            <h2>Register Product</h2>
          </div>
          <div className="field-grid">
            <label>
              Product Code
              <input required value={registerForm.productCode} onChange={(event) => setRegisterForm({ ...registerForm, productCode: event.target.value })} />
            </label>
            <label>
              Product Name
              <input required value={registerForm.productName} onChange={(event) => setRegisterForm({ ...registerForm, productName: event.target.value })} />
            </label>
            <label className="wide">
              Product Owner Wallet
              <input required value={registerForm.productOwner} onChange={(event) => setRegisterForm({ ...registerForm, productOwner: event.target.value })} />
            </label>
            <label>
              Category
              <input value={registerForm.category} onChange={(event) => setRegisterForm({ ...registerForm, category: event.target.value })} />
            </label>
            <label>
              Brand
              <input value={registerForm.brand} onChange={(event) => setRegisterForm({ ...registerForm, brand: event.target.value })} />
            </label>
            <label className="wide">
              Image URL
              <input value={registerForm.imageUrl} onChange={(event) => setRegisterForm({ ...registerForm, imageUrl: event.target.value })} />
            </label>
            <label className="wide">
              Description
              <textarea value={registerForm.description} onChange={(event) => setRegisterForm({ ...registerForm, description: event.target.value })} />
            </label>
            <label>
              Seller Name
              <input value={registerForm.sellerName} onChange={(event) => setRegisterForm({ ...registerForm, sellerName: event.target.value })} />
            </label>
            <label>
              Seller Wallet
              <input value={registerForm.sellerWallet} onChange={(event) => setRegisterForm({ ...registerForm, sellerWallet: event.target.value })} />
            </label>
            <label className="wide">
              Seller Contact
              <input value={registerForm.sellerContact} onChange={(event) => setRegisterForm({ ...registerForm, sellerContact: event.target.value })} />
            </label>
          </div>
          <button className="primary-button" type="submit">
            <ShieldCheck size={18} />
            Register
          </button>
        </form>

        <div className="stack">
          <form className="panel" onSubmit={verifyProduct}>
            <div className="panel-heading">
              <Search size={20} />
              <h2>Verify Authenticity</h2>
            </div>
            <label>
              Product Code
              <input required value={verifyCode} onChange={(event) => setVerifyCode(event.target.value)} />
            </label>
            <button className="primary-button" type="submit">
              <CheckCircle2 size={18} />
              Verify
            </button>
            {verification && (
              <div className={verification.authentic ? "result authentic" : "result invalid"}>
                <strong>{verification.productCode}</strong>
                <span>{verification.authentic ? "Authentic" : "Not authentic or not registered"}</span>
                {verification.metadata?.productName && <small>{verification.metadata.productName}</small>}
              </div>
            )}
          </form>

          <form className="panel" onSubmit={loadProductDetails}>
            <div className="panel-heading">
              <Database size={20} />
              <h2>Product Details</h2>
            </div>
            <label>
              Blockchain Product ID
              <input required type="number" min="1" value={detailId} onChange={(event) => setDetailId(event.target.value)} />
            </label>
            <button type="submit">
              <Search size={18} />
              Load
            </button>
            {selectedProduct && (
              <dl className="details-list">
                <dt>Code</dt>
                <dd>{selectedProduct.productCode}</dd>
                <dt>Name</dt>
                <dd>{selectedProduct.productName}</dd>
                <dt>Authentic</dt>
                <dd>{selectedProduct.authentic ? "Yes" : "No"}</dd>
                <dt>Owner</dt>
                <dd>{shortAddress(selectedProduct.currentOwner)}</dd>
                <dt>Description</dt>
                <dd>{selectedProduct.metadata?.description || "No metadata"}</dd>
              </dl>
            )}
          </form>
        </div>
      </section>

      <section className="workspace-grid lower-grid">
        <form className="panel" onSubmit={updateProduct}>
          <div className="panel-heading">
            <RefreshCw size={20} />
            <h2>Update Product</h2>
          </div>
          <div className="field-grid">
            <label>
              Product ID
              <input required type="number" min="1" value={updateForm.id} onChange={(event) => setUpdateForm({ ...updateForm, id: event.target.value })} />
            </label>
            <label>
              Product Code
              <input required value={updateForm.productCode} onChange={(event) => setUpdateForm({ ...updateForm, productCode: event.target.value })} />
            </label>
            <label>
              Product Name
              <input required value={updateForm.productName} onChange={(event) => setUpdateForm({ ...updateForm, productName: event.target.value })} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={updateForm.authentic} onChange={(event) => setUpdateForm({ ...updateForm, authentic: event.target.checked })} />
              Authentic
            </label>
            <label>
              Category
              <input value={updateForm.category} onChange={(event) => setUpdateForm({ ...updateForm, category: event.target.value })} />
            </label>
            <label>
              Brand
              <input value={updateForm.brand} onChange={(event) => setUpdateForm({ ...updateForm, brand: event.target.value })} />
            </label>
            <label className="wide">
              Image URL
              <input value={updateForm.imageUrl} onChange={(event) => setUpdateForm({ ...updateForm, imageUrl: event.target.value })} />
            </label>
            <label className="wide">
              Description
              <textarea value={updateForm.description} onChange={(event) => setUpdateForm({ ...updateForm, description: event.target.value })} />
            </label>
            <label>
              Seller Name
              <input value={updateForm.sellerName} onChange={(event) => setUpdateForm({ ...updateForm, sellerName: event.target.value })} />
            </label>
            <label>
              Seller Wallet
              <input value={updateForm.sellerWallet} onChange={(event) => setUpdateForm({ ...updateForm, sellerWallet: event.target.value })} />
            </label>
            <label className="wide">
              Seller Contact
              <input value={updateForm.sellerContact} onChange={(event) => setUpdateForm({ ...updateForm, sellerContact: event.target.value })} />
            </label>
          </div>
          <button type="submit">
            <RefreshCw size={18} />
            Update
          </button>
        </form>

        <div className="stack">
          <form className="panel" onSubmit={transferOwnership}>
            <div className="panel-heading">
              <Send size={20} />
              <h2>Transfer Ownership</h2>
            </div>
            <label>
              Product ID
              <input required type="number" min="1" value={transferId} onChange={(event) => setTransferId(event.target.value)} />
            </label>
            <label>
              New Owner Wallet
              <input required value={newOwner} onChange={(event) => setNewOwner(event.target.value)} />
            </label>
            <button type="submit">
              <Send size={18} />
              Transfer
            </button>
          </form>

          <form className="panel danger-panel" onSubmit={removeProduct}>
            <div className="panel-heading">
              <Trash2 size={20} />
              <h2>Remove Product</h2>
            </div>
            <label>
              Product ID
              <input required type="number" min="1" value={removeId} onChange={(event) => setRemoveId(event.target.value)} />
            </label>
            <label>
              Product Code
              <input value={removeCode} onChange={(event) => setRemoveCode(event.target.value)} />
            </label>
            <button type="submit">
              <Trash2 size={18} />
              Remove
            </button>
          </form>
        </div>
      </section>

      <section className="panel products-panel">
        <div className="panel-heading">
          <List size={20} />
          <h2>All Registered Products</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Authentic</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Brand</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const meta = metadata.find((item) => item.productCode === product.productCode);
                return (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.productCode}</td>
                    <td>{product.productName}</td>
                    <td>{product.authentic ? "Yes" : "No"}</td>
                    <td>{shortAddress(product.currentOwner)}</td>
                    <td>{meta?.category || ""}</td>
                    <td>{meta?.brand || ""}</td>
                    <td>
                      <button className="icon-button" onClick={() => fillUpdate(product)} title="Edit product">
                        <RefreshCw size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No products loaded
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
