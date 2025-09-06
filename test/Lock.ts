import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  async function deployLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const lockedAmount = ONE_GWEI;

    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  it("Should set the right unlockTime", async function () {
    const { lock, unlockTime } = await loadFixture(deployLockFixture);
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should set the right owner", async function () {
    const { lock, owner } = await loadFixture(deployLockFixture);
    expect(await lock.owner()).to.equal(owner.address);
  });

  it("Shouldn't allow withdrawal before unlockTime", async function () {
    const { lock } = await loadFixture(deployLockFixture);
    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });

  it("Should allow withdrawal after unlockTime", async function () {
    const { lock, unlockTime, owner, lockedAmount } = await loadFixture(deployLockFixture);

    await time.increaseTo(unlockTime);

    await expect(lock.withdraw())
      .to.changeEtherBalances([owner, lock], [lockedAmount, -lockedAmount]);
  });
});
