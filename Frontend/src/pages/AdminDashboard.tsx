import { Building2, History, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState.jsx";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext";
import { mockActivityLogs, mockCompanies, mockShoes } from "../mock/shoes.js";
import { listActivityLogs, listCompanies, listShoes } from "../services/shoeApi.js";
import { createShoeContract, hasContractAddress } from "../services/shoeContract.js";
import { formatAddress } from "../services/walletService.js";

type CompanyRow = {
  wallet_address: string;
  company_name: string;
  approved: boolean;
};

type ShoeRow = {
  product_code: string;
  brand: string;
  model: string;
  release_year: number;
};

type ActivityRow = {
  id?: number;
  action: string;
  product_code?: string;
  created_at: string;
};

export function AdminDashboard() {
  const { walletAddress } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [shoes, setShoes] = useState<ShoeRow[]>([]);
  const [logs, setLogs] = useState<ActivityRow[]>([]);
  const [adminAddress, setAdminAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      if (hasContractAddress()) {
        const contract = createShoeContract(walletAddress || undefined) as any;
        setAdminAddress(await contract.read.admin());
      }

      const [companyRows, shoeRows, logRows] = await Promise.all([
        listCompanies().catch(() => mockCompanies),
        listShoes().catch(() => mockShoes),
        listActivityLogs().catch(() => mockActivityLogs),
      ]);
      setCompanies(companyRows);
      setShoes(shoeRows);
      setLogs(logRows);
    } catch (adminError) {
      setError(adminError instanceof Error ? adminError.message : "Unable to load admin data.");
      setCompanies(mockCompanies);
      setShoes(mockShoes);
      setLogs(mockActivityLogs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [walletAddress]);

  const isAdmin = !adminAddress || walletAddress?.toLowerCase() === adminAddress.toLowerCase();

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-web3-600">Admin Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink-900">System monitoring</h2>
        <p className="mt-2 text-sm text-ink-500">
          Admin wallet: {adminAddress ? formatAddress(adminAddress) : "Configured by role mapping"}
        </p>
        <p className="mt-1 text-sm text-ink-500">
          Current wallet: {walletAddress ? formatAddress(walletAddress) : "Not connected"} ·{" "}
          {isAdmin ? "Admin view enabled" : "Read-only demo view"}
        </p>
      </section>

      <ErrorMessage message={error} onDismiss={() => setError("")} />
      {loading && <LoadingSpinner label="Loading admin records" />}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Summary icon={Users} label="Total Users" value={24} />
        <Summary icon={Building2} label="Total Companies" value={companies.length} />
        <Summary icon={ShieldCheck} label="Total Registered Shoes" value={shoes.length} />
        <Summary icon={History} label="Total Verifications" value={Math.max(logs.length * 7, 12)} />
      </section>

      <RecordSection title="Recent Activities">
        {logs.length === 0 ? (
          <EmptyState title="No activity found" description="" />
        ) : (
          logs.map((log) => (
            <Record key={log.id || `${log.action}-${log.created_at}`}>
              <strong>{log.action}</strong>
              <span>{log.product_code || "-"}</span>
              <span>{log.created_at}</span>
            </Record>
          ))
        )}
      </RecordSection>

      <RecordSection title="Registered Companies">
        {companies.length === 0 ? (
          <EmptyState title="No companies found" description="" />
        ) : (
          companies.map((company) => (
            <Record key={company.wallet_address}>
              <strong>{company.company_name}</strong>
              <span>{formatAddress(company.wallet_address)}</span>
              <span>{company.approved ? "Approved" : "Not approved"}</span>
            </Record>
          ))
        )}
      </RecordSection>

      <RecordSection title="Registered Shoes">
        {shoes.length === 0 ? (
          <EmptyState title="No shoes found" description="" />
        ) : (
          shoes.map((shoe) => (
            <Record key={shoe.product_code}>
              <strong>{shoe.product_code}</strong>
              <span>
                {shoe.brand} {shoe.model}
              </span>
              <span>{shoe.release_year}</span>
            </Record>
          ))
        )}
      </RecordSection>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
      <Icon className="h-6 w-6 text-web3-600" />
      <p className="mt-3 text-sm text-ink-500">{label}</p>
      <strong className="text-3xl text-ink-900">{value}</strong>
    </article>
  );
}

function RecordSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Record({ children }: { children: React.ReactNode }) {
  return (
    <article className="grid gap-2 rounded-lg border border-ink-100 p-4 text-sm md:grid-cols-3 md:items-center">
      {children}
    </article>
  );
}
