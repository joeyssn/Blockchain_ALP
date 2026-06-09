import { ethers } from "hardhat";

async function main() {
  const ShoeAuthenticity = await ethers.getContractFactory("ShoeAuthenticity");
  const shoeAuthenticity = await ShoeAuthenticity.deploy();

  await shoeAuthenticity.waitForDeployment();

  const address = await shoeAuthenticity.getAddress();
  console.log("ShoeAuthenticity deployed to:", address);
  console.log("Set Frontend/.env VITE_CONTRACT_ADDRESS=", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
