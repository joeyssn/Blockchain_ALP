import { Building2, PackagePlus, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext";
import { mockActivityLogs } from "../mock/shoes.js";
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

type CompanyShoe = {
  product_code: string;
  brand: string;
  model: string;
  release_year: number;
  image_url?: string;
  description?: string;
  specifications?: string;
};

export function CompanyDashboard() {
  const { companyName, wallet, walletAddress } = useAuth();
  const [editableCompanyName, setEditableCompanyName] = useState(companyName);
  const [shoeForm, setShoeForm] = useState(emptyShoe);
  const [companyShoes, setCompanyShoes] = useState<CompanyShoe[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshCompanyShoes() {
    if (!walletAddress) {
      setCompanyShoes([]);
      return;
    }

    try {
      setCompanyShoes(await listCompanyShoes(walletAddress));
    } catch {
      setCompanyShoes([]);
    }
  }

  useEffect(() => {
    setEditableCompanyName(companyName);
  }, [companyName]);

  useEffect(() => {
    refreshCompanyShoes();
  }, [walletAddress]);

  async function registerCompany(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!walletAddress) {
        throw new Error("Connect MetaMask or Rabby Wallet before registering a company.");
      }

      let txHash = "";
      if (hasContractAddress()) {
        const contract = createShoeContract(walletAddress) as any;
        txHash = await contract.write.registerCompany([editableCompanyName], {
          account: walletAddress,
        });
      }

      await saveCompany({
        walletAddress,
        companyName: editableCompanyName,
        approved: true,
        txHash,
      });
      setMessage("Company registered. You can now add shoe metadata.");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unable to register company.");
    } finally {
      setLoading(false);
    }
  }

  async function addShoe(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!walletAddress) {
        throw new Error("Connect MetaMask or Rabby Wallet before adding a shoe.");
      }

      let txHash = "";
      const existingShoe = companyShoes.find(
        (shoe) => shoe.product_code.toUpperCase() === shoeForm.productCode.trim().toUpperCase()
      );

      if (hasContractAddress()) {
        const contract = createShoeContract(walletAddress) as any;
        txHash = existingShoe
          ? await contract.write.updateShoe(
              [
                shoeForm.productCode,
                shoeForm.brand,
                shoeForm.model,
                BigInt(Number(shoeForm.releaseYear || 0)),
                true,
              ],
              { account: walletAddress }
            )
          : await contract.write.addShoe(
              [
                shoeForm.productCode,
                shoeForm.brand,
                shoeForm.model,
                BigInt(Number(shoeForm.releaseYear || 0)),
              ],
              { account: walletAddress }
            );
      }

      await saveShoe({
        ...shoeForm,
        releaseYear: Number(shoeForm.releaseYear || 0),
        companyWallet: walletAddress,
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
      setError(shoeError instanceof Error ? shoeError.message : "Unable to save shoe.");
    } finally {
      setLoading(false);
    }
  }

  const verifiedShoesCount = Math.max(companyShoes.length * 4, companyShoes.length ? 1 : 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Company Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">{companyName} operations</h2>
        <p className="mt-2 text-sm text-ink-500">
          Company wallet: {walletAddress ? formatAddress(walletAddress) : "Not connected"}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Backend records for this wallet"
          icon={PackagePlus}
          title="Registered Shoes Count"
          value={companyShoes.length}
        />
        <StatCard
          detail="Mock verification activity"
          icon={ShieldCheck}
          title="Verified Shoes Count"
          value={verifiedShoesCount}
        />
        <StatCard
          detail={wallet.chainId ? `Chain ${wallet.chainId}` : "Provider session pending"}
          icon={Building2}
          title="Company Name"
          value={companyName}
        />
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
              onChange={(event) => setEditableCompanyName(event.target.value)}
              required
              value={editableCompanyName}
            />
          </label>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
            type="submit"
          >
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
                  value={shoeForm[field as keyof typeof emptyShoe]}
                />
              </label>
            ))}
          </div>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
            type="submit"
          >
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

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink-900">Recent Activity</h3>
        <div className="mt-4 grid gap-3">
          {mockActivityLogs.slice(0, 3).map((activity) => (
            <article
              className="grid gap-1 rounded-lg border border-ink-100 p-4 text-sm md:grid-cols-3"
              key={activity.id}
            >
              <strong>{activity.action}</strong>
              <span>{activity.product_code || companyName}</span>
              <span>{activity.created_at}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
