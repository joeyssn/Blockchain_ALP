# Blockchain-Based Shoe Authenticity Verification System

Student blockchain project for verifying authentic shoes by product code.

Official shoe companies connect a wallet, register company data, and add shoe
authenticity records on-chain. Users can verify a product code and view shoe
metadata served by the backend database.

## Tech Stack

- Smart contract: Solidity
- Blockchain tooling: Hardhat
- Frontend: React, Vite, Tailwind CSS
- Blockchain interaction: Viem with injected wallets
- Wallets: MetaMask and Rabby Wallet
- Backend: Node.js and Express
- Database: MySQL

## Project Structure

- `Blockchain/` - Hardhat project and `ShoeAuthenticity.sol`
- `Backend/` - Express API, MySQL connection, SQL schema
- `Frontend/` - React dashboard and wallet-connected UI
- `docs/` - supporting project notes

## Setup

Install dependencies:

```bash
npm install
npm --prefix Backend install
npm --prefix Blockchain install
npm --prefix Frontend install
```

Create environment files:

```bash
copy Backend\.env.example Backend\.env
copy Frontend\.env.example Frontend\.env
```

## MySQL Setup

Create the database and tables:

```bash
mysql -u root -p < Backend/schema.sql
```

Update `Backend/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shoe_authenticity
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

The backend can start without MySQL and will use temporary in-memory data for
demo purposes, but MySQL is required for the proposal-complete setup.

## Smart Contract

Run tests:

```bash
npm test
```

Compile:

```bash
npm --prefix Blockchain run build
```

Deploy to a running Hardhat network:

```bash
npx --prefix Blockchain hardhat node
npm run deploy:contract
```

Copy the deployed contract address into:

```env
Frontend/.env
VITE_CONTRACT_ADDRESS=0x...
```

## Run Backend

```bash
npm run dev:backend
```

Backend API:

- `GET /health`
- `GET /api/companies`
- `POST /api/companies`
- `GET /api/shoes`
- `POST /api/shoes`
- `GET /api/verify/:productCode`
- `GET /api/activity-logs`

## Run Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## User Workflows

User:

1. Open website
2. Enter a shoe product code such as `NIKE001`
3. Click Verify
4. View authenticity result and shoe details

Company:

1. Connect MetaMask or Rabby Wallet
2. Register company
3. Add shoe product
4. Store authenticity data on-chain and metadata in MySQL
5. View own registered shoes

Admin:

1. Connect MetaMask or Rabby Wallet
2. View all registered companies
3. View all registered shoes
4. Monitor activity logs

## Scope Notes

This project only focuses on shoe authenticity verification. It does not include
cryptocurrency payments, NFT features, QR scanning, marketplace functionality,
cart features, or ownership transfer workflows.
