import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

async function deployFixture() {
  const { viem } = await network.create();
  const [admin, company, otherCompany, user] = await viem.getWalletClients();
  const contract = await viem.deployContract("ShoeAuthenticity");

  return { contract, admin, company, otherCompany, user };
}

async function registrationFee(contract: any) {
  return contract.read.registrationFee();
}

async function verificationFee(contract: any) {
  return contract.read.verificationFee();
}

async function registerCompany(contract: any, company: any, name = "Nike Official") {
  await contract.write.registerCompany([name], {
    account: company.account,
  });
}

describe("ShoeAuthenticity", () => {
  it("registers a company", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    const registeredCompany = await contract.read.companies([
      company.account.address,
    ]);

    assert.equal(registeredCompany[0].toLowerCase(), company.account.address.toLowerCase());
    assert.equal(registeredCompany[1], "Nike Official");
    assert.equal(registeredCompany[2], true);
  });

  it("registers a shoe from an approved company", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);
    await contract.write.addShoe(["NIKE001", "Nike", "Air Jordan 1", 1985n], {
      account: company.account,
      value: await registrationFee(contract),
    });

    const shoe = await contract.read.getShoe(["NIKE001"]);

    assert.equal(shoe.productCode, "NIKE001");
    assert.equal(shoe.brand, "Nike");
    assert.equal(shoe.model, "Air Jordan 1");
    assert.equal(shoe.releaseYear, 1985n);
    assert.equal(shoe.companyWallet.toLowerCase(), company.account.address.toLowerCase());
    assert.equal(shoe.authentic, true);
  });

  it("verifies a registered authentic shoe", async () => {
    const { contract, company, user } = await deployFixture();

    await registerCompany(contract, company);
    await contract.write.addShoe(["ADIDAS001", "Adidas", "Samba OG", 1950n], {
      account: company.account,
      value: await registrationFee(contract),
    });

    const result = await contract.simulate.verifyShoe(["ADIDAS001"], {
      account: user.account,
      value: await verificationFee(contract),
    });

    assert.equal(result.result, true);
  });

  it("updates shoe information", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);
    await contract.write.addShoe(["NB001", "New Balance", "990v5", 2019n], {
      account: company.account,
      value: await registrationFee(contract),
    });
    await contract.write.updateShoe(
      ["NB001", "New Balance", "990v6", 2022n, true],
      { account: company.account }
    );

    const shoe = await contract.read.getShoe(["NB001"]);

    assert.equal(shoe.model, "990v6");
    assert.equal(shoe.releaseYear, 2022n);
    assert.equal(shoe.authentic, true);
  });

  it("rejects an unauthorized wallet adding a shoe", async () => {
    const { contract, user } = await deployFixture();

    await assert.rejects(
      contract.write.addShoe(["FAKE001", "Fake", "Unknown", 2026n], {
        account: user.account,
        value: await registrationFee(contract),
      })
    );
  });

  it("returns false when verifying a non-existing product code", async () => {
    const { contract, user } = await deployFixture();

    const result = await contract.simulate.verifyShoe(["UNKNOWN001"], {
      account: user.account,
      value: await verificationFee(contract),
    });

    assert.equal(result.result, false);
  });

  it("rejects updating a non-existing shoe", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    await assert.rejects(
      contract.write.updateShoe(
        ["MISSING001", "Nike", "Missing Model", 2026n, true],
        { account: company.account }
      )
    );
  });

  it("rejects duplicate product codes", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);
    await contract.write.addShoe(["NIKE002", "Nike", "Dunk Low", 1985n], {
      account: company.account,
      value: await registrationFee(contract),
    });

    await assert.rejects(
      contract.write.addShoe(["NIKE002", "Nike", "Dunk Low", 1985n], {
        account: company.account,
        value: await registrationFee(contract),
      })
    );
  });

  it("rejects registration without fee", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    await assert.rejects(
      contract.write.addShoe(["FREE001", "Nike", "Free Shoe", 2026n], {
        account: company.account,
      })
    );
  });

  it("tracks and withdraws collected fees", async () => {
    const { contract, admin, company, user } = await deployFixture();

    await registerCompany(contract, company);
    await contract.write.addShoe(["FEE001", "Nike", "Fee Shoe", 2026n], {
      account: company.account,
      value: await registrationFee(contract),
    });
    await contract.write.verifyShoe(["FEE001"], {
      account: user.account,
      value: await verificationFee(contract),
    });

    const stats = await contract.read.getFeeStats();
    assert.equal(stats[3], 2n);
    assert.equal(stats[0], stats[1] + stats[2]);

    await contract.write.withdrawFees([], {
      account: admin.account,
    });
  });
});
