import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PriceAutomation contract...");

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Uniswap V2 Factory and WETH addresses on Base Sepolia
  const UNISWAP_V2_FACTORY = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6"; // Base Sepolia Uniswap V2 Factory
  const WETH = "0x4200000000000000000000000000000000000006"; // Base Sepolia WETH

  // Deploy contract
  const PriceAutomation = await ethers.getContractFactory("PriceAutomation");
  const priceAutomation = await PriceAutomation.deploy(
    UNISWAP_V2_FACTORY,
    WETH
  );

  await priceAutomation.waitForDeployment();
  const contractAddress = await priceAutomation.getAddress();

  console.log("✅ PriceAutomation deployed to:", contractAddress);
  console.log("🏭 Uniswap V2 Factory:", UNISWAP_V2_FACTORY);
  console.log("💎 WETH:", WETH);
  console.log("📊 Token: Not set (use setToken() to set)");

  // Verify contract on Basescan (if needed)
  console.log("\n🔍 Verifying contract on Basescan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        UNISWAP_V2_FACTORY,
        WETH
      ],
    });
    console.log("✅ Contract verified on Basescan");
  } catch (error) {
    console.log("⚠️  Verification failed:", error);
  }

  // Save deploy information
  const deployInfo = {
    contractAddress,
    factory: UNISWAP_V2_FACTORY,
    weth: WETH,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deploy Information:");
  console.log(JSON.stringify(deployInfo, null, 2));

  console.log("\n📝 Next steps:");
  console.log("1. Set token address: await contract.setToken(tokenAddress)");
  console.log("2. Start automation: await contract.startAutomation(startTime)");
  console.log("3. Register automation with Chainlink");

  return {
    contractAddress,
    priceAutomation
  };
}

// Run script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 