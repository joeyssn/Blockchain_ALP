import { Menu, ShieldCheck } from "lucide-react";
import { WalletButton } from "./WalletButton";

type NavbarProps = {
  onMenuClick: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/85 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open navigation"
            className="rounded-lg border border-ink-200 p-2 text-ink-700 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-web3-600" />
              <h1 className="text-lg font-bold text-ink-900">Blockchain Shoe Verification</h1>
            </div>
            <p className="hidden text-sm text-ink-500 sm:block">
              Verify authentic shoes using wallet-based role authorization
            </p>
          </div>
        </div>

        <WalletButton />
      </div>
    </header>
  );
}
