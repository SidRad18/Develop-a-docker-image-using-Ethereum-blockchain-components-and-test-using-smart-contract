// scripts/deploy_assetmanager.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const AssetManager = await ethers.getContractFactory("AssetManager");
  const assetManager = await AssetManager.deploy();

  await assetManager.waitForDeployment();

  console.log("✅ AssetManager deployed at:", await assetManager.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
