// scripts/deploy.js
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1) get factory
  const AssetManager = await ethers.getContractFactory("AssetManager");

  // 2) deploy (add constructor args inside deploy(...) if your contract needs them)
  const assetManager = await AssetManager.deploy();

  // 3) wait for the deployment to be mined (ethers v6)
  await assetManager.waitForDeployment();

  // 4) get the deployed address
  const addr = await assetManager.getAddress();
  console.log("AssetManager deployed to:", addr);

  // 5) save it to a file for easy reuse
  fs.writeFileSync("deployed.json", JSON.stringify({ network: "localhost", address: addr }, null, 2));
  console.log("Saved deployed.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
