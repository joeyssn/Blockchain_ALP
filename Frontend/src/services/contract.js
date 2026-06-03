import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
} from "viem";
import { hardhat } from "viem/chains";

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const productAuthenticityAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "registerProduct",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_productCode", type: "string" },
      { name: "_productName", type: "string" },
      { name: "_productOwner", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "verifyProduct",
    stateMutability: "view",
    inputs: [{ name: "_productCode", type: "string" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getProduct",
    stateMutability: "view",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [
      { type: "uint256" },
      { type: "string" },
      { type: "string" },
      { type: "bool" },
      { type: "address" },
      { type: "address" },
    ],
  },
  {
    type: "function",
    name: "updateProduct",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_id", type: "uint256" },
      { name: "_newName", type: "string" },
      { name: "_authentic", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "removeProduct",
    stateMutability: "nonpayable",
    inputs: [{ name: "_id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "transferOwnership",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_id", type: "uint256" },
      { name: "_newOwner", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getAllProducts",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "productCode", type: "string" },
          { name: "productName", type: "string" },
          { name: "authentic", type: "bool" },
          { name: "registeredBy", type: "address" },
          { name: "currentOwner", type: "address" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
];

export function hasWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function requestWalletAccount() {
  if (!hasWallet()) {
    throw new Error("No Ethereum wallet detected");
  }

  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return account;
}

export function createProductContract(account) {
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set VITE_CONTRACT_ADDRESS to the deployed contract address");
  }

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: hasWallet() ? custom(window.ethereum) : http(),
  });

  const walletClient = hasWallet()
    ? createWalletClient({
        account,
        chain: hardhat,
        transport: custom(window.ethereum),
      })
    : null;

  return getContract({
    address: contractAddress,
    abi: productAuthenticityAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
}

export function normalizeProduct(product) {
  return {
    id: Number(product.id ?? product[0]),
    productCode: product.productCode ?? product[1],
    productName: product.productName ?? product[2],
    authentic: product.authentic ?? product[3],
    registeredBy: product.registeredBy ?? product[4],
    currentOwner: product.currentOwner ?? product[5],
    exists: product.exists ?? product[6],
  };
}
