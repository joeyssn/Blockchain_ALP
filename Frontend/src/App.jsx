import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorMessage } from "./components/ErrorMessage.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { OwnershipTransfer } from "./pages/OwnershipTransfer.jsx";
import { Products } from "./pages/Products.jsx";
import { Profile } from "./pages/Profile.jsx";
import { RegisterProduct } from "./pages/RegisterProduct.jsx";
import { TransactionHistory } from "./pages/TransactionHistory.jsx";
import { VerifyProduct } from "./pages/VerifyProduct.jsx";
import {
  connectWallet,
  disconnectWallet,
  isSupportedChain,
  listenAccountChanges,
  listenChainChanges,
} from "./services/walletService.js";

const initialWallet = {
  provider: null,
  ethersProvider: null,
  signer: null,
  walletName: "",
  address: "",
  chainId: null,
  connected: false,
};

export function App() {
  const [wallet, setWallet] = useState(initialWallet);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect(preferredWallet) {
    setWalletLoading(true);
    setError("");

    try {
      const nextWallet = await connectWallet(preferredWallet);
      setWallet(nextWallet);
    } catch (walletError) {
      setError(walletError.message);
    } finally {
      setWalletLoading(false);
    }
  }

  function handleDisconnect() {
    setWallet(disconnectWallet());
    setError("");
  }

  useEffect(() => {
    if (!wallet.provider) {
      return undefined;
    }

    const stopAccountListener = listenAccountChanges(wallet.provider, (address) => {
      if (!address) {
        setWallet(disconnectWallet());
        setError("Wallet account disconnected.");
        return;
      }

      setWallet((current) => ({ ...current, address }));
    });

    const stopChainListener = listenChainChanges(wallet.provider, (chainId) => {
      setWallet((current) => ({ ...current, chainId }));

      if (!isSupportedChain(chainId)) {
        setError(`Unsupported network. Connected chain ID ${chainId}.`);
      } else {
        setError("");
      }
    });

    return () => {
      stopAccountListener();
      stopChainListener();
    };
  }, [wallet.provider]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ink-50 text-ink-900">
        <div className="flex min-h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar
              loading={walletLoading}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onMenuClick={() => setSidebarOpen(true)}
              wallet={wallet}
            />
            <main className="flex-1 p-4 lg:p-6">
              <div className="mx-auto grid max-w-7xl gap-6">
                <ErrorMessage message={error} onDismiss={() => setError("")} />
                <Routes>
                  <Route element={<Dashboard wallet={wallet} />} path="/" />
                  <Route element={<Products />} path="/products" />
                  <Route element={<RegisterProduct />} path="/register" />
                  <Route element={<VerifyProduct />} path="/verify" />
                  <Route element={<OwnershipTransfer />} path="/transfer" />
                  <Route element={<TransactionHistory />} path="/transactions" />
                  <Route element={<Profile wallet={wallet} />} path="/profile" />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
