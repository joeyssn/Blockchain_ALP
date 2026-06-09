import { ArrowRight, Building2, ShieldCheck, UserSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/StatCard.jsx";
import { useRegisteredShoes } from "../services/shoeService";

export function Home() {
  const { shoes } = useRegisteredShoes();
  const sampleShoes = shoes.slice(0, 3);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-ink-900 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold text-web3-400">
          Blockchain-Based Shoe Authenticity Verification System
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Verify whether a shoe is authentic by code, shoe, or company name.
            </h2>
            <p className="mt-3 max-w-2xl text-ink-200">
              Official shoe companies register authentic shoes on-chain. Users can
              search the shared shoe inventory and view registration details.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-web3-500 px-5 py-3 font-semibold text-white hover:bg-web3-400"
            to="/verify"
          >
            Verify Shoe
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Public users can verify without account registration"
          icon={UserSearch}
          title="User Workflow"
          value="Verify"
        />
        <StatCard
          detail="Companies connect wallet and register authentic shoes"
          icon={Building2}
          title="Company Workflow"
          value="Register"
        />
        <StatCard
          detail="Admin monitors companies, shoes, and system activity"
          icon={ShieldCheck}
          title="Admin Workflow"
          value="Monitor"
        />
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold text-ink-900">Try a sample shoe search</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {sampleShoes.map((shoe) => (
            <Link
              className="rounded-xl border border-ink-100 p-4 hover:border-web3-500 hover:bg-web3-50"
              key={shoe.id}
              to={`/verify?q=${encodeURIComponent(shoe.shoeCode || shoe.shoeName)}`}
            >
              <p className="text-xs font-semibold uppercase text-web3-700">{shoe.shoeCode}</p>
              <p className="font-bold text-ink-900">{shoe.shoeName}</p>
              <p className="text-sm text-ink-500">{shoe.companyName}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
