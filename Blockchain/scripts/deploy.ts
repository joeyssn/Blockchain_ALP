import hre from "hardhat";

async function main() {

    const contract =
        await hre.viem.deployContract(
            "CertificateVerification"
        );

    console.log(
        "Contract deployed to:",
        contract.address
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});