import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // ── Deploy LandShares ─────────────────────────────────────────────────────
  console.log("Deploying LandShares...");
  const LandShares = await ethers.getContractFactory("LandShares");
  const landShares = await LandShares.deploy();
  await landShares.waitForDeployment();
  const landSharesAddr = await landShares.getAddress();
  console.log("✅ LandShares deployed to:", landSharesAddr);

  // ── Deploy Marketplace ────────────────────────────────────────────────────
  console.log("\nDeploying InvesTerraMarketplace...");
  const Marketplace = await ethers.getContractFactory("InvesTerraMarketplace");
  const marketplace = await Marketplace.deploy(landSharesAddr);
  await marketplace.waitForDeployment();
  const marketplaceAddr = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddr);

  // ── Create sample properties ──────────────────────────────────────────────
  console.log("\nCreating sample properties...");

  const properties = [
    { name: "Green Valley Estate — Dehradun", shares: 500, uri: "ipfs://property-metadata/dehradun.json" },
    { name: "Coastal Coconut Grove — Goa", shares: 1000, uri: "ipfs://property-metadata/goa.json" },
    { name: "Golden Sands — Jaisalmer", shares: 2000, uri: "ipfs://property-metadata/jaisalmer.json" },
    { name: "Wine Country Ranch — Nashik", shares: 700, uri: "ipfs://property-metadata/nashik.json" },
    { name: "Spice Highlands — Wayanad", shares: 400, uri: "ipfs://property-metadata/wayanad.json" },
    { name: "Tech Corridor Plot — Hyderabad", shares: 200, uri: "ipfs://property-metadata/hyderabad.json" },
  ];

  for (const prop of properties) {
    const tx = await landShares.createProperty(prop.name, prop.shares, prop.uri);
    await tx.wait();
    console.log(`  ✅ Created: ${prop.name} (${prop.shares} shares)`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`NEXT_PUBLIC_LAND_SHARES_CONTRACT=${landSharesAddr}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT=${marketplaceAddr}`);
  console.log("=".repeat(60));
  console.log("\nAdd these to your .env file and restart the dev server.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
