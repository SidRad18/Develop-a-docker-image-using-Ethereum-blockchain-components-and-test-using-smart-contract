// scripts/interact_demo.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const contractAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"; // deployed address

  const Lock = await ethers.getContractFactory("Lock");
  const lock = Lock.attach(contractAddress);

  // check state
  const owner = await lock.owner();
  const unlockTime = await lock.unlockTime();
  const balanceBefore = await ethers.provider.getBalance(contractAddress);

  console.log("🔑 Owner:", owner);
  console.log("⏰ UnlockTime:", unlockTime.toString());
  console.log("💰 Contract Balance Before:", ethers.formatEther(balanceBefore));

  // try withdrawal before unlock
  console.log("\n🚨 Trying withdrawal before unlock...");
  try {
    const tx = await lock.withdraw();
    await tx.wait();
    console.log("✅ Withdrawal succeeded (unexpected!)");
  } catch (err) {
    console.log("❌ Withdrawal failed as expected:", err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
