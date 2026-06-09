import { expect } from "chai";
import { ethers } from "hardhat";

async function deployFixture() {
  const [admin, company, otherCompany, user] = await ethers.getSigners();
  const ShoeAuthenticity = await ethers.getContractFactory("ShoeAuthenticity");
  const contract = await ShoeAuthenticity.deploy();
  await contract.waitForDeployment();

  return { contract, admin, company, otherCompany, user };
}

async function registerCompany(contract: any, company: any, name = "Nike Official") {
  await contract.connect(company).registerCompany(name);
}

describe("ShoeAuthenticity", () => {
  it("registers a company", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    const registeredCompany = await contract.companies(company.address);

    expect(registeredCompany.wallet.toLowerCase()).to.equal(company.address.toLowerCase());
    expect(registeredCompany.companyName).to.equal("Nike Official");
    expect(registeredCompany.approved).to.equal(true);
  });

  it("registers a shoe from an approved company with fee", async () => {
    const { contract, company } = await deployFixture();
    const fee = await contract.registrationFee();

    await registerCompany(contract, company);
    await contract.connect(company).addShoe("NIKE001", "Nike", "Air Jordan 1", 1985, {
      value: fee,
    });

    const shoe = await contract.getShoe("NIKE001");

    expect(shoe.productCode).to.equal("NIKE001");
    expect(shoe.brand).to.equal("Nike");
    expect(shoe.model).to.equal("Air Jordan 1");
    expect(shoe.releaseYear).to.equal(1985n);
    expect(shoe.companyWallet.toLowerCase()).to.equal(company.address.toLowerCase());
    expect(shoe.authentic).to.equal(true);
  });

  it("verifies a registered authentic shoe with fee", async () => {
    const { contract, company, user } = await deployFixture();

    await registerCompany(contract, company);
    await contract.connect(company).addShoe("ADIDAS001", "Adidas", "Samba OG", 1950, {
      value: await contract.registrationFee(),
    });

    await expect(
      contract.connect(user).verifyShoe("ADIDAS001", {
        value: await contract.verificationFee(),
      })
    ).to.emit(contract, "ProductVerified").withArgs("ADIDAS001", user.address);
  });

  it("updates shoe information", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);
    await contract.connect(company).addShoe("NB001", "New Balance", "990v5", 2019, {
      value: await contract.registrationFee(),
    });
    await contract.connect(company).updateShoe("NB001", "New Balance", "990v6", 2022, true);

    const shoe = await contract.getShoe("NB001");

    expect(shoe.model).to.equal("990v6");
    expect(shoe.releaseYear).to.equal(2022n);
    expect(shoe.authentic).to.equal(true);
  });

  it("rejects an unauthorized wallet adding a shoe", async () => {
    const { contract, user } = await deployFixture();

    await expect(
      contract.connect(user).addShoe("FAKE001", "Fake", "Unknown", 2026, {
        value: await contract.registrationFee(),
      })
    ).to.be.revertedWith("Company is not registered or approved");
  });

  it("returns false when verifying a non-existing product code", async () => {
    const { contract, user } = await deployFixture();

    await expect(
      contract.connect(user).verifyShoe("UNKNOWN001", {
        value: await contract.verificationFee(),
      })
    ).to.emit(contract, "ShoeVerified").withArgs("UNKNOWN001", false);
  });

  it("rejects updating a non-existing shoe", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    await expect(
      contract.connect(company).updateShoe("MISSING001", "Nike", "Missing Model", 2026, true)
    ).to.be.revertedWith("Shoe does not exist");
  });

  it("rejects duplicate product codes", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);
    await contract.connect(company).addShoe("NIKE002", "Nike", "Dunk Low", 1985, {
      value: await contract.registrationFee(),
    });

    await expect(
      contract.connect(company).addShoe("NIKE002", "Nike", "Dunk Low", 1985, {
        value: await contract.registrationFee(),
      })
    ).to.be.revertedWith("Product code already exists");
  });

  it("rejects registration without fee", async () => {
    const { contract, company } = await deployFixture();

    await registerCompany(contract, company);

    await expect(
      contract.connect(company).addShoe("FREE001", "Nike", "Free Shoe", 2026)
    ).to.be.revertedWith("Insufficient registration fee");
  });

  it("tracks and withdraws collected fees", async () => {
    const { contract, admin, company, user } = await deployFixture();

    await registerCompany(contract, company);
    await contract.connect(company).addShoe("FEE001", "Nike", "Fee Shoe", 2026, {
      value: await contract.registrationFee(),
    });
    await contract.connect(user).verifyShoe("FEE001", {
      value: await contract.verificationFee(),
    });

    const stats = await contract.getFeeStats();
    expect(stats.transactionCount).to.equal(2n);
    expect(stats.totalFeesCollected).to.equal(stats.registrationTotal + stats.verificationTotal);

    await expect(contract.connect(admin).withdrawFees()).to.emit(contract, "FeesWithdrawn");
  });
});
