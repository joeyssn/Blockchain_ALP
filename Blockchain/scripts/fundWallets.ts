import { ethers } from "hardhat";

const ROLE_WALLETS = [
  { label: "Admin", address: "0xC095f05fB4b21C506BA9Ec2f0D22CA7a17A693CB" },
  { label: "Nike", address: "0xd8264294B27C43E5944A6932c7A27D885CB5c758" },
  { label: "Adidas", address: "0x12Ee27D5b5B5e74D2AD1CfD9020C943B9e121D03" },
  { label: "Puma", address: "0x0c766c042ABf07f93dcdd06e9d1637d817dE7A63" },
  { label: "User", address: "0xC785636260Af01923302100C21a85a04B5806CF9" },
];

async function main() {
  const [owner] = await ethers.getSigners();
  const amount = ethers.parseEther("1");

  console.log("Funding role wallets from:", owner.address);

  for (const wallet of ROLE_WALLETS) {
    const tx = await owner.sendTransaction({
      to: wallet.address,
      value: amount,
    });

    await tx.wait();

    const balance = await ethers.provider.getBalance(wallet.address);
    console.log(`${wallet.label} funded: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
