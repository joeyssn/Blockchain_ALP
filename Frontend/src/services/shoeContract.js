import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  isAddress,
} from "viem";
import { hardhat } from "viem/chains";

export const EXPECTED_CHAIN_ID = hardhat.id;
export const localRpcUrl = import.meta.env.VITE_LOCAL_RPC_URL || "http://127.0.0.1:8545";
export const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();

export const shoeAuthenticityAbi = [
  {
    type: "function",
    name: "admin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "registerCompany",
    stateMutability: "nonpayable",
    inputs: [{ name: "_companyName", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "addShoe",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_productCode", type: "string" },
      { name: "_brand", type: "string" },
      { name: "_model", type: "string" },
      { name: "_releaseYear", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateShoe",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_productCode", type: "string" },
      { name: "_brand", type: "string" },
      { name: "_model", type: "string" },
      { name: "_releaseYear", type: "uint256" },
      { name: "_authentic", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "verifyShoe",
    stateMutability: "nonpayable",
    inputs: [{ name: "_productCode", type: "string" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event",
    name: "ProductRegistered",
    inputs: [
      { name: "shoeCode", type: "string", indexed: false },
      { name: "company", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ProductVerified",
    inputs: [
      { name: "shoeCode", type: "string", indexed: false },
      { name: "verifier", type: "address", indexed: false },
    ],
  },
  {
    type: "function",
    name: "getShoe",
    stateMutability: "view",
    inputs: [{ name: "_productCode", type: "string" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "productCode", type: "string" },
          { name: "brand", type: "string" },
          { name: "model", type: "string" },
          { name: "releaseYear", type: "uint256" },
          { name: "companyWallet", type: "address" },
          { name: "authentic", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCompanyShoes",
    stateMutability: "view",
    inputs: [{ name: "_companyWallet", type: "address" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "productCode", type: "string" },
          { name: "brand", type: "string" },
          { name: "model", type: "string" },
          { name: "releaseYear", type: "uint256" },
          { name: "companyWallet", type: "address" },
          { name: "authentic", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getAllShoes",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "productCode", type: "string" },
          { name: "brand", type: "string" },
          { name: "model", type: "string" },
          { name: "releaseYear", type: "uint256" },
          { name: "companyWallet", type: "address" },
          { name: "authentic", type: "bool" },
        ],
      },
    ],
  },
];

function getEthereum() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.ethereum || null;
}

function createClients(account) {
  const ethereum = getEthereum();
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(localRpcUrl),
  });

  const walletClient =
    ethereum && account
      ? createWalletClient({
          account,
          chain: hardhat,
          transport: custom(ethereum),
        })
      : null;

  return { publicClient, walletClient };
}

export function hasContractAddress() {
  return (
    isAddress(contractAddress) &&
    contractAddress &&
    contractAddress !== "0x0000000000000000000000000000000000000000"
  );
}

export function getContractConfiguration() {
  return {
    address: contractAddress,
    expectedChainId: EXPECTED_CHAIN_ID,
    rpcUrl: localRpcUrl,
    hasAddress: hasContractAddress(),
    abiFunctions: shoeAuthenticityAbi.filter((item) => item.type === "function").map((item) => item.name),
  };
}

async function assertContractAddress() {
  if (!contractAddress) {
    throw new Error("Missing VITE_CONTRACT_ADDRESS. Deploy the contract and restart Vite.");
  }

  if (!isAddress(contractAddress)) {
    throw new Error(`Invalid VITE_CONTRACT_ADDRESS: ${contractAddress}`);
  }

  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS to the deployed ShoeAuthenticity address, not the zero address.");
  }
}

async function assertContractDeployed(publicClient) {
  const bytecode = await publicClient.getBytecode({ address: contractAddress });

  if (!bytecode || bytecode === "0x") {
    throw new Error(
      `No ShoeAuthenticity bytecode found at ${contractAddress} on chain ${EXPECTED_CHAIN_ID}. Deploy the contract again and restart Vite.`
    );
  }

  return bytecode;
}

async function assertWalletNetwork(walletClient) {
  if (!walletClient) {
    return;
  }

  const connectedChainId = await walletClient.getChainId();

  if (connectedChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `Wrong wallet network. Expected Chain: ${EXPECTED_CHAIN_ID}. Connected Chain: ${connectedChainId}. Switch Rabby/MetaMask to localhost Hardhat.`
    );
  }
}

export async function validateShoeContract(account) {
  await assertContractAddress();

  const { publicClient, walletClient } = createClients(account);
  const publicChainId = await publicClient.getChainId();

  if (publicChainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `Local Hardhat RPC chain mismatch. Expected Chain: ${EXPECTED_CHAIN_ID}. Connected Chain: ${publicChainId}.`
    );
  }

  await assertWalletNetwork(walletClient);
  await assertContractDeployed(publicClient);

  console.log("[VERIFY] Contract Loaded", getContractConfiguration());

  return { publicClient, walletClient };
}

export function createShoeContract(account) {
  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS to the deployed ShoeAuthenticity address");
  }

  const { publicClient, walletClient } = createClients(account);

  return getContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
}

function requireWalletClient(walletClient) {
  if (!walletClient) {
    throw new Error("Connect MetaMask or Rabby Wallet before sending a blockchain transaction.");
  }
}

export async function sendRegisterProductTransaction({ account, shoeCode, companyName, shoeName }) {
  const { publicClient, walletClient } = await validateShoeContract(account);
  requireWalletClient(walletClient);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "addShoe",
    args: [shoeCode, companyName, shoeName, 0n],
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return {
    hash,
    receipt,
  };
}

export async function sendVerifyProductTransaction({ account, shoeCode }) {
  console.log("[VERIFY] Transaction Started", { account, shoeCode });
  const { publicClient, walletClient } = await validateShoeContract(account);
  requireWalletClient(walletClient);
  console.log("[VERIFY] Wallet Connected", { account, expectedChainId: EXPECTED_CHAIN_ID });

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "verifyShoe",
    args: [shoeCode],
    account,
  });
  console.log("[VERIFY] Transaction Submitted", { hash });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("[VERIFY] Transaction Confirmed", {
    hash,
    blockNumber: receipt.blockNumber?.toString(),
    status: receipt.status,
  });

  return {
    hash,
    receipt,
  };
}

export function normalizeShoe(shoe) {
  return {
    productCode: shoe.productCode ?? shoe[0],
    brand: shoe.brand ?? shoe[1],
    model: shoe.model ?? shoe[2],
    releaseYear: Number(shoe.releaseYear ?? shoe[3]),
    companyWallet: shoe.companyWallet ?? shoe[4],
    authentic: Boolean(shoe.authentic ?? shoe[5]),
  };
}
