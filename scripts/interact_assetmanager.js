// scripts/interact_assetmanager.js
import pkg from "hardhat";
import fs from "fs";
const { ethers } = pkg;

async function main() {
  const [owner, user2] = await ethers.getSigners();

  // 👇 Replace with your deployed contract address
  const assetManagerAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Load ABI from artifacts
  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/AssetManager.sol/AssetManager.json", "utf8")
  );

  // Connect to deployed contract as owner
  const assetManager = new ethers.Contract(assetManagerAddr, artifact.abi, owner);

  console.log("📌 Using AssetManager at:", assetManagerAddr);

  // 1️⃣ Register asset as owner
  let tx = await assetManager.registerAsset("Company Laptop");
  await tx.wait();
  console.log("✅ Asset registered by owner");

  // 2️⃣ Get asset details
  let asset = await assetManager.getAsset(1);
  console.log(`🔎 Asset[1]: id=${asset[0]}, name=${asset[1]}, owner=${asset[2]}`);

  // 3️⃣ Transfer asset to user2
  tx = await assetManager.transferAsset(1, user2.address);
  await tx.wait();
  console.log(`✏️ Asset[1] transferred to: ${user2.address}`);

  // 4️⃣ Check asset after transfer
  asset = await assetManager.getAsset(1);
  console.log(`🔎 Asset[1] after transfer: id=${asset[0]}, name=${asset[1]}, owner=${asset[2]}`);

  // 5️⃣ Connect as user2 and transfer back to owner
  const assetManagerUser2 = assetManager.connect(user2);
  tx = await assetManagerUser2.transferAsset(1, owner.address);
  await tx.wait();
  console.log(`↩️ Asset[1] transferred back to owner: ${owner.address}`);

  // 6️⃣ Get all assets
  const allAssets = await assetManager.getAllAssets();
  console.log("📦 All registered assets:");
  allAssets.forEach((a) => {
    console.log(`- id=${a.id}, name=${a.name}, owner=${a.owner}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
