import { ethers } from "hardhat";

async function main() {
  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const hello = await HelloWorld.deploy();
  await hello.deployed();
  console.log(`HelloWorld contract deployed at: ${hello.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
