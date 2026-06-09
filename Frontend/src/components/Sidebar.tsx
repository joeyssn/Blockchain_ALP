import { Building2, Home, ShieldCheck, UserCircle, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Role } from "../config/roles";
import { useAuth } from "../context/AuthContext";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const links = [
  { to: "/", label: "Home", icon: Home, roles: [Role.USER, Role.COMPANY, Role.ADMIN] },
  { to: "/verify", label: "Verify Shoe", icon: ShieldCheck, roles: [Role.USER, Role.COMPANY, Role.ADMIN] },
  { to: "/company-dashboard", label: "Company Dashboard", icon: Building2, roles: [Role.COMPANY] },
  { to: "/admin-dashboard", label: "Admin Dashboard", icon: UsersRound, roles: [Role.ADMIN] },
  { to: "/profile", label: "Profile", icon: UserCircle, roles: [Role.USER, Role.COMPANY, Role.ADMIN] },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { companyName, role, walletAddress } = useAuth();
  const visibleLinks = links.filter((link) => link.roles.includes(role));

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
            SV
          </div>
          <div>
            <p className="font-bold text-ink-900">ShoeVerify</p>
            <p className="text-xs text-ink-500">Blockchain authenticity</p>
          </div>
        </div>

        <nav className="grid gap-1">
          {visibleLinks.map((link) => {
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
          <p className="text-sm font-semibold">{companyName || `${role} wallet`}</p>
          <p className="mt-1 break-all text-xs text-ink-200">{walletAddress}</p>
        </div>
      </aside>
    </>
  );
}
