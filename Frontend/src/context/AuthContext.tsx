import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Role, getCompanyName, getRole, isValidWalletAddress } from "../config/roles";
import {
  connectWallet as connectInjectedWallet,
  disconnectWallet as resetWalletConnection,
  getCurrentAccount,
  getCurrentChain,
  isSupportedChain,
  listenAccountChanges,
  listenChainChanges,
} from "../services/walletService.js";

type WalletPreference = "auto" | "metamask" | "rabby";

type WalletState = {
  provider: unknown;
  ethersProvider: unknown;
  signer: unknown;
  walletName: string;
  address: string;
  chainId: number | null;
  connected: boolean;
};

type AuthContextValue = {
  wallet: WalletState;
  walletAddress: string;
  role: Role;
  companyName: string;
  isAuthenticated: boolean;
  isConnecting: boolean;
  authError: string;
  setAuthError: (message: string) => void;
  connectWallet: (preferredWallet?: WalletPreference) => Promise<void>;
  disconnectWallet: () => void;
};

const AUTH_STORAGE_KEY = "shoeverify.auth";

const initialWallet: WalletState = {
  provider: null,
  ethersProvider: null,
  signer: null,
  walletName: "",
  address: "",
  chainId: null,
  connected: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveAuth(address: string) {
  const role = getRole(address);

  return {
    walletAddress: address,
    role,
    companyName: role === Role.COMPANY ? getCompanyName(address) : "",
    isAuthenticated: isValidWalletAddress(address),
  };
}

function readStoredAuth() {
  if (typeof window === "undefined") {
    return deriveAuth("");
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
    return deriveAuth(stored.walletAddress || "");
  } catch {
    return deriveAuth("");
  }
}

function persistAuth(address: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextAuth = deriveAuth(address);
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
}

function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedAuth = useMemo(() => readStoredAuth(), []);
  const [wallet, setWallet] = useState<WalletState>({
    ...initialWallet,
    address: storedAuth.walletAddress,
    connected: storedAuth.isAuthenticated,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState("");

  const { walletAddress, role, companyName, isAuthenticated } = deriveAuth(wallet.address);

  const disconnectWallet = useCallback(() => {
    setWallet(resetWalletConnection());
    setAuthError("");
    clearAuthStorage();
  }, []);

  const connectWallet = useCallback(async (preferredWallet: WalletPreference = "auto") => {
    setIsConnecting(true);
    setAuthError("");

    try {
      const nextWallet = await connectInjectedWallet(preferredWallet);
      const normalizedWallet = nextWallet as WalletState;
      const nextAuth = deriveAuth(normalizedWallet.address);

      setWallet({ ...normalizedWallet, connected: nextAuth.isAuthenticated });
      persistAuth(normalizedWallet.address);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect wallet.";
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProviderSession() {
      if (wallet.provider || !wallet.address) {
        return;
      }

      try {
        const currentAddress = await getCurrentAccount();
        const chainId = await getCurrentChain();

        if (cancelled || !currentAddress) {
          return;
        }

        const nextAuth = deriveAuth(currentAddress);
        setWallet((current) => ({
          ...current,
          address: currentAddress,
          chainId,
          connected: nextAuth.isAuthenticated,
        }));
        persistAuth(currentAddress);

        if (chainId && !isSupportedChain(chainId)) {
          setAuthError(`Unsupported network. Connected chain ID ${chainId}.`);
        }
      } catch {
        setWallet((current) => ({ ...current, connected: Boolean(current.address) }));
      }
    }

    hydrateProviderSession();

    return () => {
      cancelled = true;
    };
  }, [wallet.address, wallet.provider]);

  useEffect(() => {
    if (!wallet.provider) {
      return undefined;
    }

    const stopAccountListener = listenAccountChanges(wallet.provider, (address: string) => {
      if (!address) {
        disconnectWallet();
        setAuthError("Wallet account disconnected.");
        return;
      }

      setWallet((current) => ({ ...current, address, connected: isValidWalletAddress(address) }));
      persistAuth(address);
    });

    const stopChainListener = listenChainChanges(wallet.provider, (chainId: number | null) => {
      setWallet((current) => ({ ...current, chainId }));

      if (chainId && !isSupportedChain(chainId)) {
        setAuthError(`Unsupported network. Connected chain ID ${chainId}.`);
      } else {
        setAuthError("");
      }
    });

    return () => {
      stopAccountListener();
      stopChainListener();
    };
  }, [disconnectWallet, wallet.provider]);

  const value = useMemo<AuthContextValue>(
    () => ({
      wallet,
      walletAddress,
      role,
      companyName,
      isAuthenticated,
      isConnecting,
      authError,
      setAuthError,
      connectWallet,
      disconnectWallet,
    }),
    [
      authError,
      companyName,
      connectWallet,
      disconnectWallet,
      isAuthenticated,
      isConnecting,
      role,
      wallet,
      walletAddress,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
