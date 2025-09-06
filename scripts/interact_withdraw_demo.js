// scripts/interact_withdraw_demo.js
import pkg from "hardhat";
const { ethers } = pkg;

const CONTRACT_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"; // replace if different

async function main() {
  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.attach(CONTRACT_ADDRESS);

  const [owner] = await ethers.getSigners();
  const unlockTime = await lock.unlockTime();

  console.log("🔑 Owner:", owner.address);
  console.log("⏰ UnlockTime:", unlockTime.toString());

  // Show balance before
  let balanceBefore = await ethers.provider.getBalance(lock.target ?? lock.address);
  console.log("💰 Contract Balance Before:", ethers.formatEther(balanceBefore));

  // ---- ⏩ Increase time past unlock ----
  await ethers.provider.send("evm_increaseTime", [3600]); // +1 hour
  await ethers.provider.send("evm_mine"); // mine a block

  console.log("\n⏩ Time advanced by 1 hour...");

  // Try withdrawal now
  console.log("🚀 Withdrawing...");
  const tx = await lock.withdraw();
  await tx.wait();

  // Show balance after
  let balanceAfter = await ethers.provider.getBalance(lock.target ?? lock.address);
  console.log("💰 Contract Balance After:", ethers.formatEther(balanceAfter));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
