import { BrowserProvider } from "ethers";

const supportedChains = new Set([1, 5, 11155111, 31337]);

function getInjectedProviders() {
  if (typeof window === "undefined") {
    return [];
  }

  const ethereum = window.ethereum;
  const providers = ethereum?.providers || [ethereum, window.rabby].filter(Boolean);

  return providers.filter(Boolean);
}

export function detectWallets() {
  const providers = getInjectedProviders();

  return {
    metamask: providers.find((provider) => provider.isMetaMask && !provider.isRabby),
    rabby: providers.find((provider) => provider.isRabby),
    providers,
  };
}

function selectProvider(preferredWallet = "auto") {
  const wallets = detectWallets();

  if (preferredWallet === "rabby") {
    return wallets.rabby;
  }

  if (preferredWallet === "metamask") {
    return wallets.metamask;
  }

  return wallets.rabby || wallets.metamask || wallets.providers[0];
}

function normalizeChainId(chainId) {
  if (typeof chainId === "number") {
    return chainId;
  }

  if (typeof chainId === "string") {
    return Number.parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
  }

  return null;
}

function getWalletName(provider) {
  if (provider?.isRabby) {
    return "Rabby Wallet";
  }

  if (provider?.isMetaMask) {
    return "MetaMask";
  }

  return "Injected Wallet";
}

function ensureSupportedNetwork(chainId) {
  if (!supportedChains.has(chainId)) {
    throw new Error(
      `Unsupported network. Connected chain ID ${chainId}. Use Ethereum, Sepolia, Goerli, or local Hardhat.`
    );
  }
}

export async function connectWallet(preferredWallet = "auto") {
  const provider = selectProvider(preferredWallet);

  if (!provider) {
    const walletName = preferredWallet === "rabby" ? "Rabby Wallet" : "MetaMask or Rabby Wallet";
    throw new Error(`${walletName} is not installed. Install a wallet extension and try again.`);
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const network = await ethersProvider.getNetwork();
    const chainId = Number(network.chainId);

    ensureSupportedNetwork(chainId);

    return {
      provider,
      ethersProvider,
      signer,
      walletName: getWalletName(provider),
      address: accounts[0] || (await signer.getAddress()),
      chainId,
      connected: true,
    };
  } catch (error) {
    if (error?.code === 4001) {
      throw new Error("Wallet connection was rejected. Approve the request to continue.");
    }

    throw new Error(error?.message || "Unable to connect wallet.");
  }
}

export function disconnectWallet() {
  return {
    provider: null,
    ethersProvider: null,
    signer: null,
    walletName: "",
    address: "",
    chainId: null,
    connected: false,
  };
}

export async function getCurrentAccount(provider = selectProvider()) {
  if (!provider) {
    return "";
  }

  const accounts = await provider.request({ method: "eth_accounts" });
  return accounts[0] || "";
}

export async function getCurrentChain(provider = selectProvider()) {
  if (!provider) {
    return null;
  }

  const chainId = await provider.request({ method: "eth_chainId" });
  return normalizeChainId(chainId);
}

export function listenAccountChanges(provider, callback) {
  if (!provider?.on) {
    return () => {};
  }

  const handler = (accounts) => callback(accounts[0] || "");
  provider.on("accountsChanged", handler);

  return () => provider.removeListener?.("accountsChanged", handler);
}

export function listenChainChanges(provider, callback) {
  if (!provider?.on) {
    return () => {};
  }

  const handler = (chainId) => callback(normalizeChainId(chainId));
  provider.on("chainChanged", handler);

  return () => provider.removeListener?.("chainChanged", handler);
}

export function formatAddress(address) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isSupportedChain(chainId) {
  return supportedChains.has(Number(chainId));
}
