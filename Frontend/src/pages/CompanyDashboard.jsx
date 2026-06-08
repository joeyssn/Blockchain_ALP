import { Building2, PackagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { listCompanyShoes, saveCompany, saveShoe } from "../services/shoeApi.js";
import { createShoeContract, hasContractAddress } from "../services/shoeContract.js";
import { formatAddress } from "../services/walletService.js";

const emptyShoe = {
  productCode: "",
  brand: "",
  model: "",
  releaseYear: "",
  imageUrl: "",
  description: "",
  specifications: "",
};

export function CompanyDashboard({ wallet }) {
  const [companyName, setCompanyName] = useState("");
  const [shoeForm, setShoeForm] = useState(emptyShoe);
  const [companyShoes, setCompanyShoes] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshCompanyShoes() {
    if (!wallet.address) {
      setCompanyShoes([]);
      return;
    }

    try {
      setCompanyShoes(await listCompanyShoes(wallet.address));
    } catch {
      setCompanyShoes([]);
    }
  }

  useEffect(() => {
    refreshCompanyShoes();
  }, [wallet.address]);

  async function registerCompany(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!wallet.connected) {
        throw new Error("Connect MetaMask or Rabby Wallet before registering a company.");
      }

      let txHash = "";
      if (hasContractAddress()) {
        const contract = createShoeContract(wallet.address);
        txHash = await contract.write.registerCompany([companyName], {
          account: wallet.address,
        });
      }

      await saveCompany({
        walletAddress: wallet.address,
        companyName,
        approved: true,
        txHash,
      });
      setMessage("Company registered. You can now add shoe metadata.");
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoading(false);
    }
  }

  async function addShoe(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!wallet.connected) {
        throw new Error("Connect MetaMask or Rabby Wallet before adding a shoe.");
      }

      let txHash = "";
      const existingShoe = companyShoes.find(
        (shoe) => shoe.product_code.toUpperCase() === shoeForm.productCode.trim().toUpperCase()
      );

      if (hasContractAddress()) {
        const contract = createShoeContract(wallet.address);
        txHash = existingShoe
          ? await contract.write.updateShoe(
              [
                shoeForm.productCode,
                shoeForm.brand,
                shoeForm.model,
                BigInt(Number(shoeForm.releaseYear || 0)),
                true,
              ],
              { account: wallet.address }
            )
          : await contract.write.addShoe(
              [
                shoeForm.productCode,
                shoeForm.brand,
                shoeForm.model,
                BigInt(Number(shoeForm.releaseYear || 0)),
              ],
              { account: wallet.address }
            );
      }

      await saveShoe({
        ...shoeForm,
        releaseYear: Number(shoeForm.releaseYear || 0),
        companyWallet: wallet.address,
        txHash,
      });
      setShoeForm(emptyShoe);
      setMessage(
        existingShoe
          ? "Shoe information updated successfully."
          : "Shoe saved. Blockchain authenticity is ready when contract is deployed."
      );
      await refreshCompanyShoes();
    } catch (shoeError) {
      setError(shoeError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Company Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Register company and shoes</h2>
        <p className="mt-2 text-sm text-ink-500">
          Connected wallet: {wallet.connected ? formatAddress(wallet.address) : "Not connected"}
        </p>
      </section>

      <ErrorMessage message={error} onDismiss={() => setError("")} />
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft" onSubmit={registerCompany}>
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-web3-600" />
            <h3 className="text-lg font-bold text-ink-900">Register Company</h3>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Company Name
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setCompanyName(event.target.value)}
              required
              value={companyName}
            />
          </label>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500" type="submit">
            {loading ? <LoadingSpinner label="Saving" /> : <Save className="h-5 w-5" />}
            Register Company
          </button>
        </form>

        <form className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft" onSubmit={addShoe}>
          <div className="mb-4 flex items-center gap-3">
            <PackagePlus className="h-6 w-6 text-web3-600" />
            <h3 className="text-lg font-bold text-ink-900">Add Shoe Product</h3>
          </div>
          <div className="grid gap-3">
            {[
              ["productCode", "Product Code"],
              ["brand", "Brand"],
              ["model", "Model"],
              ["releaseYear", "Release Year"],
              ["imageUrl", "Image URL"],
              ["description", "Description"],
              ["specifications", "Specifications"],
            ].map(([field, label]) => (
              <label className="grid gap-2 text-sm font-semibold text-ink-700" key={field}>
                {label}
                <input
                  className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
                  onChange={(event) =>
                    setShoeForm((current) => ({ ...current, [field]: event.target.value }))
                  }
                  required={["productCode", "brand", "model", "releaseYear"].includes(field)}
                  value={shoeForm[field]}
                />
              </label>
            ))}
          </div>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500" type="submit">
            {loading ? <LoadingSpinner label="Saving" /> : <PackagePlus className="h-5 w-5" />}
            Add Shoe
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink-900">My Registered Shoes</h3>
        {companyShoes.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No shoes found" description="Register a company and add your first shoe." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100">
              <tbody className="divide-y divide-ink-100">
                {companyShoes.map((shoe) => (
                  <tr key={shoe.product_code}>
                    <td className="px-4 py-3 font-semibold">{shoe.product_code}</td>
                    <td className="px-4 py-3">{shoe.brand}</td>
                    <td className="px-4 py-3">{shoe.model}</td>
                    <td className="px-4 py-3">{shoe.release_year}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:border-web3-500"
                        onClick={() =>
                          setShoeForm({
                            productCode: shoe.product_code,
                            brand: shoe.brand,
                            model: shoe.model,
                            releaseYear: String(shoe.release_year),
                            imageUrl: shoe.image_url || "",
                            description: shoe.description || "",
                            specifications: shoe.specifications || "",
                          })
                        }
                        type="button"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
