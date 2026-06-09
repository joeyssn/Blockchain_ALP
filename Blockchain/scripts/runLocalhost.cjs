const path = require("path");

const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error("Usage: node scripts/runLocalhost.cjs <script>");
  process.exit(1);
}

process.env.HARDHAT_NETWORK = process.env.HARDHAT_NETWORK || "localhost";

require("ts-node/register");
require("hardhat/register");
require(path.resolve(process.cwd(), scriptPath));
