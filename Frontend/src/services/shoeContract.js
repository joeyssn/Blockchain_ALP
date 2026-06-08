import {
  createPublicClient,
  createWalletClient,
  custom,
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

  return getContract({
    address: contractAddress,
    abi: shoeAuthenticityAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });
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
