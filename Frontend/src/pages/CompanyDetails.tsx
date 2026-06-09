import { Building2, PackageCheck, ShieldCheck } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { findCompanyById } from "../mock/companyInventory";
import {
  formatRegistrationDate,
  getShoesByCompany,
  getVerifiedShoeCount,
  useRegisteredShoes,
} from "../services/shoeService";

export function CompanyDetails() {
  const { companyId } = useParams();
  const { error, loading, shoes: allShoes } = useRegisteredShoes();
  const company = findCompanyById(companyId);

  if (!company) {
    return <Navigate replace to="/admin-dashboard" />;
  }

  const companyShoes = getShoesByCompany(company.id, allShoes);

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Company Details</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">{company.name}</h2>
        <p className="mt-2 text-sm text-ink-500">
          Inventory is scoped to this company only.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard detail="Trusted company profile" icon={Building2} title="Company Name" value={company.name} />
        <StatCard
          detail="Inventory records for this company"
          icon={PackageCheck}
          title="Total Shoes"
          value={companyShoes.length}
        />
        <StatCard
          detail="Verified inventory records"
          icon={ShieldCheck}
          title="Verified Shoes"
          value={getVerifiedShoeCount(companyShoes)}
        />
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <ErrorMessage message={error} onDismiss={() => undefined} />
        {loading && <LoadingSpinner label="Loading shoes" />}
        <h3 className="text-lg font-bold text-ink-900">Company Inventory</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {companyShoes.map((shoe) => (
            <article className="rounded-lg border border-ink-100 p-4" key={shoe.id}>
              {shoe.imageUrl && (
                <img
                  alt={shoe.shoeName}
                  className="mb-4 h-36 w-full rounded-lg object-cover"
                  src={shoe.imageUrl}
                />
              )}
              <p className="text-xs font-semibold uppercase text-web3-700">{shoe.shoeCode}</p>
              <p className="font-bold text-ink-900">{shoe.shoeName}</p>
              <p className="mt-1 text-sm text-ink-500">{shoe.description}</p>
              <p className="mt-3 text-xs font-semibold text-ink-500">
                Registered on {formatRegistrationDate(shoe.createdAt)}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  shoe.verificationStatus === "verified"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {shoe.verificationStatus}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
