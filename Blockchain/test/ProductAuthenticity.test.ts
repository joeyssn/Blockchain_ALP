import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

async function deployFixture() {
  const { viem } = await network.create();
  const [owner, productOwner, nextOwner, stranger] =
    await viem.getWalletClients();
  const contract = await viem.deployContract("ProductAuthenticity");

  return { contract, owner, productOwner, nextOwner, stranger };
}

describe("ProductAuthenticity", () => {
  it("registers a product", async () => {
    const { contract, owner, productOwner } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-001",
      "Original Sneakers",
      productOwner.account.address,
    ]);

    const product = await contract.read.getProduct([1n]);

    assert.equal(product[0], 1n);
    assert.equal(product[1], "PRD-001");
    assert.equal(product[2], "Original Sneakers");
    assert.equal(product[3], true);
    assert.equal(product[4].toLowerCase(), owner.account.address.toLowerCase());
    assert.equal(product[5].toLowerCase(), productOwner.account.address.toLowerCase());
  });

  it("verifies a registered authentic product", async () => {
    const { contract, productOwner } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-002",
      "Verified Watch",
      productOwner.account.address,
    ]);

    assert.equal(await contract.read.verifyProduct(["PRD-002"]), true);
  });

  it("updates product information and authenticity", async () => {
    const { contract, productOwner } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-003",
      "Luxury Bag",
      productOwner.account.address,
    ]);
    await contract.write.updateProduct([1n, "Luxury Bag V2", false]);

    const product = await contract.read.getProduct([1n]);

    assert.equal(product[2], "Luxury Bag V2");
    assert.equal(product[3], false);
    assert.equal(await contract.read.verifyProduct(["PRD-003"]), false);
  });

  it("rejects unauthorized updates", async () => {
    const { contract, productOwner, stranger } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-004",
      "Camera",
      productOwner.account.address,
    ]);

    await assert.rejects(
      contract.write.updateProduct([1n, "Camera Pro", true], {
        account: stranger.account,
      })
    );
  });

  it("returns false when verifying an invalid product code", async () => {
    const { contract } = await deployFixture();

    assert.equal(await contract.read.verifyProduct(["UNKNOWN"]), false);
  });

  it("rejects removing a non-existing product", async () => {
    const { contract } = await deployFixture();

    await assert.rejects(contract.write.removeProduct([404n]));
  });

  it("transfers product ownership", async () => {
    const { contract, productOwner, nextOwner } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-005",
      "Headphones",
      productOwner.account.address,
    ]);
    await contract.write.transferOwnership([1n, nextOwner.account.address], {
      account: productOwner.account,
    });

    const product = await contract.read.getProduct([1n]);

    assert.equal(product[5].toLowerCase(), nextOwner.account.address.toLowerCase());
  });

  it("removes products from verification and all-products results", async () => {
    const { contract, productOwner } = await deployFixture();

    await contract.write.registerProduct([
      "PRD-006",
      "Tablet",
      productOwner.account.address,
    ]);
    await contract.write.removeProduct([1n]);

    assert.equal(await contract.read.verifyProduct(["PRD-006"]), false);
    assert.equal((await contract.read.getAllProducts()).length, 0);
  });
});
