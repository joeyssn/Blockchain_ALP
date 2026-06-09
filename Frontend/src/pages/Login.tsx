import { CheckCircle2, ShieldCheck, Wallet, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorMessage } from "../components/ErrorMessage.jsx";
import { roleLabels } from "../config/roles";
import { useAuth } from "../context/AuthContext";
import { formatAddress } from "../services/walletService.js";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export function Login() {
  const {
    authError,
    companyName,
    connectWallet,
    isAuthenticated,
    isConnecting,
    role,
    setAuthError,
    wallet,
    walletAddress,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LoginLocationState | null)?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  async function handleConnect(preferredWallet: "metamask" | "rabby") {
    try {
      await connectWallet(preferredWallet);
      navigate(from, { replace: true });
    } catch {
      // AuthContext already stores a friendly error message.
    }
  }

  return (
    <main className="min-h-screen bg-ink-950 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.18),_transparent_35%)] px-4 py-8 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-web3-100 backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Wallet-Based RBAC
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Access ShoeVerify with your authorized wallet.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-200">
            Your connected wallet address automatically determines whether you enter as a user,
            company, or admin. No passwords, no duplicate accounts.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-ink-200 sm:grid-cols-3">
            {["Users verify shoes", "Companies manage products", "Admins monitor activity"].map(
              (item) => (
                <div className="rounded-xl border border-white/10 bg-white/10 p-4" key={item}>
                  <CheckCircle2 className="mb-3 h-5 w-5 text-web3-300" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="rounded-xl border border-white/10 bg-ink-950/70 p-5">
            <p className="text-sm font-semibold text-web3-300">Connect Wallet</p>
            <h2 className="mt-2 text-2xl font-bold">Choose your wallet</h2>
            <p className="mt-2 text-sm text-ink-300">
              MetaMask and Rabby are supported. Unsupported networks and rejected requests are shown
              here with clear status.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-web3-500 px-4 py-3 font-semibold text-white hover:bg-web3-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isConnecting}
                onClick={() => handleConnect("metamask")}
                type="button"
              >
                <Wallet className="h-5 w-5" />
                {isConnecting ? "Connecting..." : "MetaMask"}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-semibold text-white hover:border-web3-300 hover:text-web3-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isConnecting}
                onClick={() => handleConnect("rabby")}
                type="button"
              >
                <Wallet className="h-5 w-5" />
                Rabby
              </button>
            </div>

            <div className="mt-5">
              <ErrorMessage message={authError} onDismiss={() => setAuthError("")} />
            </div>

            <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-sm">
              <StatusRow
                label="Wallet Status"
                value={isAuthenticated ? "Connected" : "Not connected"}
                positive={isAuthenticated}
              />
              <StatusRow
                label="Connected Address"
                value={walletAddress ? formatAddress(walletAddress) : "Waiting for wallet"}
              />
              <StatusRow label="Role Badge" value={isAuthenticated ? roleLabels[role] : "-"} />
              <StatusRow label="Company Badge" value={companyName || "-"} />
              <StatusRow label="Network" value={wallet.chainId ? `Chain ${wallet.chainId}` : "-"} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusRow({
  label,
  positive,
  value,
}: {
  label: string;
  positive?: boolean;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-300">{label}</span>
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold text-white">
        {positive === undefined ? null : positive ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        ) : (
          <XCircle className="h-4 w-4 text-red-300" />
        )}
        {value}
      </span>
    </div>
  );
}
