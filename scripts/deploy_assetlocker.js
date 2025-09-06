import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AssetLocker with deployer:", deployer.address);

  // Use your deployed AssetManager contract address here
  const assetManagerAddr = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";

  // Get the contract factory using contract name, NOT address
  const AssetLocker = await ethers.getContractFactory("AssetLocker");
  const assetLocker = await AssetLocker.deploy(assetManagerAddr);

  await assetLocker.waitForDeployment?.(); // optional depending on ethers version

  console.log("✅ AssetLocker deployed to:", assetLocker.target ?? assetLocker.address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
