import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import { expect } from "chai";
import pkg from "hardhat"; 
const { ethers } = pkg;

describe("Lock", function () {
  // Fixture to deploy the contract
  async function deployLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const lockedAmount = ethers.parseEther("1");
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  it("Should set the right owner and unlockTime", async function () {
    const { lock, owner, unlockTime } = await loadFixture(deployLockFixture);

    expect(await lock.owner()).to.equal(owner.address);
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should not allow withdrawal before unlockTime", async function () {
    const { lock } = await loadFixture(deployLockFixture);

    await expect(lock.withdraw()).to.be.revertedWith("Lock: not yet unlocked");
  });

  it("Should allow withdrawal after unlockTime", async function () {
    const { lock, owner } = await loadFixture(deployLockFixture);

    // Increase time to after unlockTime
    await time.increaseTo(await lock.unlockTime());

    const balanceBefore = await ethers.provider.getBalance(owner.address);

    const tx = await lock.withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * (tx.gasPrice ?? 0n);

    const balanceAfter = await ethers.provider.getBalance(owner.address);

    expect(balanceAfter).to.be.greaterThan(balanceBefore - gasUsed);
  });

  it("Should revert withdrawal for non-owner", async function () {
    const { lock, otherAccount } = await loadFixture(deployLockFixture);

    await time.increaseTo(await lock.unlockTime());

    await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
      "Only owner can withdraw"
    );
  });
});
