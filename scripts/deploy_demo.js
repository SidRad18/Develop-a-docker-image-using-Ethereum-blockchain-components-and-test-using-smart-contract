// scripts/deploy_demo.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  const now = block.timestamp;

  // Add 1 hour buffer instead of 60 sec
  const unlockTime = now + 3600; // 1 hour later

  const Lock = await ethers.getContractFactory("Lock");
  console.log("Deploying Lock with unlockTime (unix):", unlockTime);

  const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.01") });

  await lock.waitForDeployment();

  const address = lock.target ?? lock.address ?? (await lock.getAddress?.());
  console.log("✅ Lock deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
