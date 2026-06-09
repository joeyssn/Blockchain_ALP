import { ethers } from "hardhat";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ENV_PATH = path.resolve(__dirname, "../../Frontend/.env.local");
const DEPLOYMENT_PATH = path.resolve(__dirname, "../deployments/localhost.json");

function upsertEnvValue(content: string, key: string, value: string) {
  const line = `${key}=${value}`;

  if (new RegExp(`^${key}=.*$`, "m").test(content)) {
    return content.replace(new RegExp(`^${key}=.*$`, "m"), line);
  }

  return `${content.trimEnd()}\n${line}\n`;
}

function writeLocalDeployment(address: string) {
  fs.mkdirSync(path.dirname(DEPLOYMENT_PATH), { recursive: true });
  fs.writeFileSync(
    DEPLOYMENT_PATH,
    `${JSON.stringify(
      {
        network: "localhost",
        chainId: 31337,
        contractName: "ShoeAuthenticity",
        address,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
}

function writeFrontendEnv(address: string) {
  const existing = fs.existsSync(FRONTEND_ENV_PATH)
    ? fs.readFileSync(FRONTEND_ENV_PATH, "utf8")
    : "VITE_BACKEND_URL=http://localhost:5000\n";
  const next = upsertEnvValue(existing, "VITE_CONTRACT_ADDRESS", address);

  fs.writeFileSync(FRONTEND_ENV_PATH, next);
}

async function main() {
  const ShoeAuthenticity = await ethers.getContractFactory("ShoeAuthenticity");
  const shoeAuthenticity = await ShoeAuthenticity.deploy();

  await shoeAuthenticity.waitForDeployment();

  const address = await shoeAuthenticity.getAddress();
  writeLocalDeployment(address);
  writeFrontendEnv(address);

  console.log("ShoeAuthenticity deployed to:", address);
  console.log("Updated Frontend/.env.local VITE_CONTRACT_ADDRESS=", address);
  console.log("Updated Blockchain/deployments/localhost.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
