# Product Authenticity Verification System

## Architecture

The project is split into three layers:

- `Blockchain`: Hardhat smart contract project for critical authenticity data.
- `Backend`: Express and MongoDB API for off-chain metadata.
- `Frontend`: React and Vite dashboard for product workflows.

## Blockchain Responsibilities

`ProductAuthenticity.sol` stores only data required for authenticity and ownership:

- `id`
- `productCode`
- `productName`
- `authentic`
- `registeredBy`
- `currentOwner`
- `exists`

The proposal's core structure is preserved, with `currentOwner` and `exists` added to support ownership transfer and safe removal.

## Off-Chain Responsibilities

MongoDB stores product metadata that should not live on-chain:

- product image URL
- description
- category
- brand
- seller name
- seller wallet/contact
- flexible metadata

Records are linked by `productCode` and `blockchainProductId`.

## Contract Features

- `registerProduct`
- `verifyProduct`
- `getProduct`
- `updateProduct`
- `removeProduct`
- `transferOwnership`
- `getAllProducts`
- `onlyOwner` authorization for admin management
- event logging for registration, update, removal, and ownership transfer

## Backend API

Base URL: `http://localhost:5000`

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/products` | List metadata |
| POST | `/api/products` | Create metadata |
| GET | `/api/products/:productCode` | Get metadata by product code |
| PUT | `/api/products/:productCode` | Update metadata |
| DELETE | `/api/products/:productCode` | Delete metadata |

## Setup

### Blockchain

```bash
cd Blockchain
npm install
npm run build
npm test
npx hardhat run scripts/deploy.ts
```

### Backend

```bash
cd Backend
npm install
copy .env.example .env
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Set `VITE_CONTRACT_ADDRESS` to the deployed contract address.
