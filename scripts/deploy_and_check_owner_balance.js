// scripts/deploy_and_check_owner_balance.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [owner] = await ethers.getSigners();
  const Lock = await ethers.getContractFactory("Lock");

  // get current chain timestamp from the node
  const block = await ethers.provider.getBlock(await ethers.provider.getBlockNumber());
  const now = block.timestamp;

  const unlockTime = now + 3600; // 1 hour in future (small demo)
  const lockedAmount = ethers.parseEther("0.01"); // amount to lock

  console.log("Deploying Lock with unlockTime (unix):", unlockTime);
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // wait for deployment (ethers v6)
  if (typeof lock.waitForDeployment === "function") {
    await lock.waitForDeployment();
  }

  const target = lock.target ?? lock.address ?? (await (lock.getAddress?.() ?? null));
  console.log("Deployed at:", target);
  console.log("Owner (deployer):", owner.address);

  // balances before
  const ownerBalBefore = await ethers.provider.getBalance(owner.address);
  const contractBalBefore = await ethers.provider.getBalance(target);

  console.log("\n--- BEFORE ---");
  console.log("Owner balance:", ethers.formatEther(ownerBalBefore), "ETH");
  console.log("Contract balance:", ethers.formatEther(contractBalBefore), "ETH");

  // fast-forward time past unlockTime
  await ethers.provider.send("evm_increaseTime", [3600]); // +1 hour
  await ethers.provider.send("evm_mine");

  console.log("\nTime advanced by 1 hour.");

  // call withdraw (owner is signer[0], so it will send from owner)
  const tx = await lock.withdraw();
  const receipt = await tx.wait();

  // gas used & effective gas price (bigints)
  const gasUsed = receipt.gasUsed;
  const effectiveGasPrice = receipt.effectiveGasPrice ?? 0n;
  const gasCost = gasUsed * effectiveGasPrice; // in wei

  // balances after
  const ownerBalAfter = await ethers.provider.getBalance(owner.address);
  const contractBalAfter = await ethers.provider.getBalance(target);

  console.log("\n--- AFTER ---");
  console.log("Owner balance:", ethers.formatEther(ownerBalAfter), "ETH");
  console.log("Contract balance:", ethers.formatEther(contractBalAfter), "ETH");

  console.log("\nTransaction / gas details:");
  console.log("Gas used:", gasUsed.toString());
  console.log("Effective gas price:", ethers.formatUnits(effectiveGasPrice, "gwei"), "gwei");
  console.log("Gas cost (ETH):", ethers.formatEther(gasCost));

  // compute net change and expected
  const netIncrease = ownerBalAfter - ownerBalBefore; // bigint
  const expectedNet = lockedAmount - gasCost; // bigint

  console.log("\nNet owner balance change:", ethers.formatEther(netIncrease), "ETH");
  console.log("Expected net change (lockedAmount - gasCost):", ethers.formatEther(expectedNet), "ETH");
  console.log("Match?:", netIncrease === expectedNet);

  if (netIncrease === expectedNet) {
    console.log("\n✅ Owner received the locked funds minus gas cost.");
  } else {
    console.log("\n⚠️ Owner balance change doesn't exactly match expectation. Investigate differences above.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
