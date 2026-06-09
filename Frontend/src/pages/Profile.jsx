import { Building2, LogOut, Network, ShieldCheck, UserCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { roleLabels } from "../config/roles";
import { useAuth } from "../context/AuthContext";
import { formatAddress, isSupportedChain } from "../services/walletService.js";

export function Profile() {
  const { companyName, disconnectWallet, role, wallet, walletAddress } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    disconnectWallet();
    navigate("/login", { replace: true });
  }

  return (
    <section className="rounded-xl border border-ink-100 bg-white p-6 shadow-soft">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-web3-50 text-web3-700">
        <UserCircle className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink-900">Wallet Profile</h2>
      <p className="mt-2 text-sm text-ink-500">
        Authentication is wallet-based through MetaMask or Rabby Wallet. Firebase
        Authentication is not used.
      </p>

      <div className="mt-6 grid gap-3">
        <ProfileRow
          icon={Wallet}
          label="Wallet Address"
          value={walletAddress || "Not connected"}
        />
        <ProfileRow icon={ShieldCheck} label="Role" value={roleLabels[role]} />
        {companyName && <ProfileRow icon={Building2} label="Company Name" value={companyName} />}
        <ProfileRow
          icon={Network}
          label="Connected Network"
          value={wallet.chainId ? `Chain ID ${wallet.chainId}` : "No network selected"}
        />
        <ProfileRow
          icon={Wallet}
          label="Account Status"
          value={
            walletAddress
              ? isSupportedChain(wallet.chainId)
                ? "Connected and supported"
                : "Unsupported network"
              : "Disconnected"
          }
        />
      </div>

      <button
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
        onClick={handleLogout}
        type="button"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </section>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-50 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-web3-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <p className="mt-1 break-all font-semibold text-ink-900">
          {String(value).startsWith("0x") ? formatAddress(value) : value}
        </p>
      </div>
    </div>
  );
}
