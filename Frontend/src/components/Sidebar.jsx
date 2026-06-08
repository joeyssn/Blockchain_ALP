import {
  Building2,
  History,
  Home,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/verify", label: "Verify Shoe", icon: ShieldCheck },
  { to: "/company", label: "Company Dashboard", icon: Building2 },
  { to: "/admin", label: "Admin Dashboard", icon: History },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink-900/40 lg:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-100 bg-white px-4 py-5 shadow-soft transition-transform lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-web3-600 font-bold text-white">
            PV
          </div>
          <div>
            <p className="font-bold text-ink-900">ShoeVerify</p>
            <p className="text-xs text-ink-500">Blockchain authenticity</p>
          </div>
        </div>

        <nav className="grid gap-1">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-web3-50 text-web3-700"
                      : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                  }`
                }
                onClick={onClose}
                to={link.to}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-ink-900 p-4 text-white">
          <p className="text-sm font-semibold">Demo mode active</p>
          <p className="mt-1 text-xs text-ink-200">
            Shoe-only verification. No payments, NFT, marketplace, or ownership transfer.
          </p>
        </div>
      </aside>
    </>
  );
}
