import { Building2, PackageCheck, Plus, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext";
import { findCompanyByName } from "../mock/companyInventory";
import {
  assertShoeCodeAvailable,
  formatRegistrationDate,
  getShoesByCompany,
  getVerifiedShoeCount,
  registerShoe,
  useRegisteredShoes,
} from "../services/shoeService";

const emptyForm = {
  shoeCode: "",
  shoeName: "",
  description: "",
  imageFile: null as File | null,
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const maybeFirebaseError = error as Error & { code?: string };
    return maybeFirebaseError.code
      ? `${maybeFirebaseError.code}: ${error.message}`
      : error.message;
  }

  return "Unable to register shoe.";
}

export function CompanyDashboard() {
  const { companyName, walletAddress } = useAuth();
  const { error: shoesError, loading: shoesLoading, shoes: allShoes } = useRegisteredShoes();
  const company = findCompanyByName(companyName);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const companyShoes = useMemo(
    () => (company ? getShoesByCompany(company.id, allShoes) : []),
    [allShoes, company]
  );

  if (!company) {
    return (
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <EmptyState
          title="Company inventory unavailable"
          description="This company wallet is recognized, but no inventory data has been configured yet."
        />
      </section>
    );
  }

  async function handleRegisterShoe(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setFormError("");

    if (!company || !walletAddress) {
      setFormError("Company wallet session is not available.");
      return;
    }

    console.log("[REGISTER] Form submitted", {
      companyId: company.id,
      companyName: company.name,
      shoeCode: form.shoeCode,
      shoeName: form.shoeName,
      hasImage: Boolean(form.imageFile),
    });

    if (!form.shoeCode.trim() || !form.shoeName.trim() || !form.description.trim()) {
      setFormError("Shoe Code, Shoe Name, and Description are required.");
      return;
    }

    setSaving(true);

    try {
      await assertShoeCodeAvailable(form.shoeCode);
      const shoe = await registerShoe({
        companyId: company.id,
        companyName: company.name,
        shoeCode: form.shoeCode,
        shoeName: form.shoeName,
        description: form.description,
        imageFile: form.imageFile,
        createdBy: walletAddress,
      });

      setForm(emptyForm);
      setMessage(`${shoe.shoeCode} - ${shoe.shoeName} was registered under ${company.name}.`);
    } catch (error) {
      console.error("[REGISTER] Registration failed", error);
      setFormError(getErrorMessage(error));
    } finally {
      console.log("[REGISTER] Loading state cleared");
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Company Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">{company.name}</h2>
        <p className="mt-2 text-sm text-ink-500">
          New shoes are automatically linked to {company.name} from the connected company wallet.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Derived from connected wallet"
          icon={Building2}
          title="Company Name"
          value={company.name}
        />
        <StatCard
          detail="Products owned by this company"
          icon={PackageCheck}
          title="Total Shoes Registered"
          value={companyShoes.length}
        />
        <StatCard
          detail="Verified inventory records"
          icon={ShieldCheck}
          title="Total Shoes Verified"
          value={getVerifiedShoeCount(companyShoes)}
        />
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-web3-600">Register New Shoe</p>
            <h3 className="text-lg font-bold text-ink-900">Add a product to {company.name}</h3>
          </div>
          <span className="rounded-full bg-web3-50 px-3 py-1 text-sm font-semibold text-web3-700">
            Company is auto-assigned
          </span>
        </div>

        <ErrorMessage message={formError || shoesError} onDismiss={() => setFormError("")} />
        {message && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form className="mt-5 grid gap-4" onSubmit={handleRegisterShoe}>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Shoe Code
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 uppercase outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) =>
                setForm((current) => ({ ...current, shoeCode: event.target.value.toUpperCase() }))
              }
              placeholder="NK-001"
              required
              value={form.shoeCode}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Shoe Name
            <input
              className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setForm((current) => ({ ...current, shoeName: event.target.value }))}
              placeholder="Air Jordan 1"
              required
              value={form.shoeName}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Description
            <textarea
              className="min-h-24 rounded-lg border border-ink-200 px-3 py-2.5 outline-none focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short product description"
              required
              value={form.description}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Shoe Image
            <span className="text-xs font-normal text-ink-500">Optional</span>
            <input
              accept="image/*"
              className="rounded-lg border border-ink-200 px-3 py-2.5 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-web3-50 file:px-3 file:py-1.5 file:font-semibold file:text-web3-700 focus:border-web3-500 focus:ring-2 focus:ring-web3-500/20"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageFile: event.target.files?.[0] || null,
                }))
              }
              type="file"
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-600 px-4 py-3 font-semibold text-white hover:bg-web3-500"
            disabled={saving}
            type="submit"
          >
            {saving ? <LoadingSpinner label="Registering" /> : <Plus className="h-5 w-5" />}
            Register Shoe
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink-900">Registered Shoes</h3>
        {shoesLoading ? <LoadingSpinner label="Loading shoes" /> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Shoe Code</th>
                <th className="px-4 py-3">Shoe Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {companyShoes.map((shoe) => (
                <tr key={shoe.id}>
                  <td className="px-4 py-3">
                    {shoe.imageUrl ? (
                      <img
                        alt={shoe.shoeName}
                        className="h-14 w-14 rounded-lg object-cover"
                        src={shoe.imageUrl}
                      />
                    ) : (
                      <span className="text-ink-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{shoe.shoeCode}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{shoe.shoeName}</td>
                  <td className="max-w-xs px-4 py-3 text-ink-500">{shoe.description}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {formatRegistrationDate(shoe.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
