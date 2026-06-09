import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  getContract,
  http,
} from "viem";
import { hardhat } from "viem/chains";

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

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
    name: "registrationFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "verificationFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getFeeStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "totalFeesCollected", type: "uint256" },
      { name: "registrationTotal", type: "uint256" },
      { name: "verificationTotal", type: "uint256" },
      { name: "transactionCount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "withdrawFees",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
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
    stateMutability: "payable",
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
    stateMutability: "payable",
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
    type: "event",
    name: "FeeCollected",
    inputs: [
      { name: "payer", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "transactionType", type: "string", indexed: false },
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
    transport: ethereum ? custom(ethereum) : http(),
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
    contractAddress &&
    contractAddress !== "0x0000000000000000000000000000000000000000"
  );
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

function getEffectiveGasPrice(receipt) {
  return receipt.effectiveGasPrice || 0n;
}

function formatWei(value) {
  return `${formatEther(value || 0n)} ETH`;
}

export { formatWei };

export async function estimateRegisterProductTransaction({ account, shoeCode, companyName, shoeName }) {
  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS before registering products on-chain.");
  }

  const { publicClient } = createClients(account);
  const protocolFeeWei = await publicClient.readContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "registrationFee",
  });
  const gas = await publicClient.estimateContractGas({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "addShoe",
    args: [shoeCode, companyName, shoeName, 0n],
    account,
    value: protocolFeeWei,
  });
  const gasPrice = await publicClient.getGasPrice();
  const estimatedGasFeeWei = gas * gasPrice;

  return {
    gas,
    gasPrice,
    protocolFeeWei,
    estimatedGasFeeWei,
    estimatedTotalWei: protocolFeeWei + estimatedGasFeeWei,
    protocolFee: formatWei(protocolFeeWei),
    estimatedGasFee: formatWei(estimatedGasFeeWei),
    estimatedTotal: formatWei(protocolFeeWei + estimatedGasFeeWei),
  };
}

export async function sendRegisterProductTransaction({ account, shoeCode, companyName, shoeName }) {
  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS before registering products on-chain.");
  }

  const { publicClient, walletClient } = createClients(account);
  requireWalletClient(walletClient);

  const protocolFeeWei = await publicClient.readContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "registrationFee",
  });
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "addShoe",
    args: [shoeCode, companyName, shoeName, 0n],
    account,
    value: protocolFeeWei,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const gasFeeWei = receipt.gasUsed * getEffectiveGasPrice(receipt);

  return {
    hash,
    receipt,
    gasUsed: receipt.gasUsed,
    gasFeeWei,
    protocolFeeWei,
    feePaidWei: gasFeeWei + protocolFeeWei,
    gasFee: formatWei(gasFeeWei),
    protocolFee: formatWei(protocolFeeWei),
    feePaid: formatWei(gasFeeWei + protocolFeeWei),
  };
}

export async function estimateVerifyProductTransaction({ account, shoeCode }) {
  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS before verifying products on-chain.");
  }

  const { publicClient } = createClients(account);
  const protocolFeeWei = await publicClient.readContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "verificationFee",
  });
  const gas = await publicClient.estimateContractGas({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "verifyShoe",
    args: [shoeCode],
    account,
    value: protocolFeeWei,
  });
  const gasPrice = await publicClient.getGasPrice();
  const estimatedGasFeeWei = gas * gasPrice;

  return {
    gas,
    gasPrice,
    protocolFeeWei,
    estimatedGasFeeWei,
    estimatedTotalWei: protocolFeeWei + estimatedGasFeeWei,
    protocolFee: formatWei(protocolFeeWei),
    estimatedGasFee: formatWei(estimatedGasFeeWei),
    estimatedTotal: formatWei(protocolFeeWei + estimatedGasFeeWei),
  };
}

export async function sendVerifyProductTransaction({ account, shoeCode }) {
  if (!hasContractAddress()) {
    throw new Error("Set VITE_CONTRACT_ADDRESS before verifying products on-chain.");
  }

  const { publicClient, walletClient } = createClients(account);
  requireWalletClient(walletClient);

  const protocolFeeWei = await publicClient.readContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "verificationFee",
  });
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "verifyShoe",
    args: [shoeCode],
    account,
    value: protocolFeeWei,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const gasFeeWei = receipt.gasUsed * getEffectiveGasPrice(receipt);

  return {
    hash,
    receipt,
    gasUsed: receipt.gasUsed,
    gasFeeWei,
    protocolFeeWei,
    feePaidWei: gasFeeWei + protocolFeeWei,
    gasFee: formatWei(gasFeeWei),
    protocolFee: formatWei(protocolFeeWei),
    feePaid: formatWei(gasFeeWei + protocolFeeWei),
  };
}

export async function getFeeStats() {
  if (!hasContractAddress()) {
    return {
      totalFeesCollected: "0 ETH",
      registrationFeesCollected: "0 ETH",
      verificationFeesCollected: "0 ETH",
      totalTransactions: 0,
    };
  }

  const { publicClient } = createClients();
  const stats = await publicClient.readContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    functionName: "getFeeStats",
  });

  return {
    totalFeesCollected: formatWei(stats[0]),
    registrationFeesCollected: formatWei(stats[1]),
    verificationFeesCollected: formatWei(stats[2]),
    totalTransactions: Number(stats[3]),
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
