import { Building2, ChevronRight, PackageCheck, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { companies, totalMockUsers } from "../mock/companyInventory";
import {
  getShoesByCompany,
  getVerifiedShoeCount,
  useRegisteredShoes,
} from "../services/shoeService";

export function AdminDashboard() {
  const { error, loading, shoes: allShoes } = useRegisteredShoes();

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Admin Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">Company monitoring</h2>
        <p className="mt-2 text-sm text-ink-500">
          Review registered companies and inspect each company inventory.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard detail="Mock platform users" icon={Users} title="Total Users" value={totalMockUsers} />
        <StatCard
          detail="Predefined trusted companies"
          icon={Building2}
          title="Total Companies"
          value={companies.length}
        />
        <StatCard
          detail="Products visible to all roles"
          icon={PackageCheck}
          title="Total Shoes Registered"
          value={allShoes.length}
        />
        <StatCard
          detail="Verified product records"
          icon={ShieldCheck}
          title="Total Shoes Verified"
          value={getVerifiedShoeCount(allShoes)}
        />
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink-900">Registered Companies</h3>
        <ErrorMessage message={error} onDismiss={() => undefined} />
        {loading && <LoadingSpinner label="Loading companies" />}
        <div className="mt-4 grid gap-3">
          {companies.map((company) => (
            <article
              className="grid gap-3 rounded-lg border border-ink-100 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              key={company.id}
            >
              <div>
                <p className="font-bold text-ink-900">{company.name}</p>
                <p className="text-sm text-ink-500">Trusted company wallet</p>
              </div>
              <div className="text-sm font-semibold text-ink-700">
                {getShoesByCompany(company.id, allShoes).length} shoes listed
              </div>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:border-web3-500 hover:text-web3-700"
                to={`/admin/company/${company.id}`}
              >
                View Details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
