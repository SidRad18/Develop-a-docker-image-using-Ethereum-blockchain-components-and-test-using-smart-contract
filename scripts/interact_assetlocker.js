// scripts/interact_assetlocker.js
import pkg from "hardhat";
import fs from "fs";
const { ethers } = pkg;

async function main() {
  const [owner, user2] = await ethers.getSigners();

  // 👇 Deployed contract addresses
  const assetManagerAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // AssetManager
  const assetLockerAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";  // AssetLocker

  // Load ABIs
  const assetManagerArtifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/AssetManager.sol/AssetManager.json", "utf8")
  );
  const assetLockerArtifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/AssetLocker.sol/AssetLocker.json", "utf8")
  );

  // Connect to contracts
  const assetManager = new ethers.Contract(assetManagerAddr, assetManagerArtifact.abi, owner);
  const assetLocker = new ethers.Contract(assetLockerAddr, assetLockerArtifact.abi, owner);

  console.log("📌 Using AssetManager at:", assetManagerAddr);
  console.log("📌 Using AssetLocker at:", assetLockerAddr);

  // 1️⃣ Register an asset
  let tx = await assetManager.registerAsset("Company Laptop");
  await tx.wait();
  console.log("✅ Asset registered by owner");

  // 2️⃣ Lock the asset for 60 seconds
  tx = await assetLocker.lockAsset(1, 60);
  await tx.wait();
  console.log("🔒 Asset[1] locked for 60 seconds");

  // 3️⃣ Try withdrawal before unlock (should fail)
  try {
    tx = await assetLocker.withdraw(1);
    await tx.wait();
    console.log("⚠️ Unexpected: Withdrawal succeeded before unlock");
  } catch (err) {
    console.log("⛔ Withdrawal before unlock failed as expected");
  }

  // 4️⃣ Advance blockchain time by 61 seconds
  await ethers.provider.send("evm_increaseTime", [61]);
  await ethers.provider.send("evm_mine");
  console.log("⏱ Time advanced by 61 seconds");

  // 5️⃣ Withdraw after unlock
  tx = await assetLocker.withdraw(1);
  await tx.wait();
  console.log("✅ Asset[1] withdrawn and returned to original owner");

  // 6️⃣ Check asset ownership
  const asset = await assetManager.getAsset(1);
  console.log(`🔎 Asset[1] current owner: ${asset[2]}`);

  // 7️⃣ View locked asset details
  const lockedAsset = await assetLocker.getLockedAsset(1);
  console.log(
    `📦 LockedAsset[1] -> assetId: ${lockedAsset[0]}, unlockTime: ${lockedAsset[1]}, originalOwner: ${lockedAsset[2]}, withdrawn: ${lockedAsset[3]}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
