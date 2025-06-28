import { ethers } from "hardhat";
import { PoolPauseAutomationABI } from "../PoolPauseAutomationABI";

async function main() {
  console.log("🚀 Deploying PoolPauseAutomation contract...");

  // Lấy signer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Địa chỉ Chainlink Price Feed cho ETH/USD trên Sepolia
  const ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia ETH/USD
  
  // Địa chỉ pool (cần thay đổi theo pool thực tế)
  const POOL_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder
  
  // Cấu hình điều kiện pause mặc định
  const defaultConditions = {
    minPriceThreshold: ethers.parseEther("1000"),    // $1000 USD
    maxPriceThreshold: ethers.parseEther("5000"),    // $5000 USD
    minVolumeThreshold: ethers.parseEther("100"),    // 100 ETH
    maxVolumeThreshold: ethers.parseEther("10000"),  // 10000 ETH
    minLiquidityThreshold: ethers.parseEther("1000"), // 1000 ETH
    checkInterval: 300, // 5 phút
    isActive: true
  };

  // Deploy contract
  const PoolPauseAutomation = await ethers.getContractFactory("PoolPauseAutomation");
  const poolPauseAutomation = await PoolPauseAutomation.deploy(
    ETH_USD_PRICE_FEED,
    POOL_ADDRESS,
    defaultConditions
  );

  await poolPauseAutomation.waitForDeployment();
  const contractAddress = await poolPauseAutomation.getAddress();

  console.log("✅ PoolPauseAutomation deployed to:", contractAddress);
  console.log("📊 Price Feed:", ETH_USD_PRICE_FEED);
  console.log("🏊 Pool Address:", POOL_ADDRESS);
  console.log("⚙️  Default Conditions:");
  console.log("   - Min Price: $1000");
  console.log("   - Max Price: $5000");
  console.log("   - Min Volume: 100 ETH");
  console.log("   - Max Volume: 10000 ETH");
  console.log("   - Min Liquidity: 1000 ETH");
  console.log("   - Check Interval: 5 minutes");

  // Verify contract trên Etherscan (nếu cần)
  console.log("\n🔍 Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        ETH_USD_PRICE_FEED,
        POOL_ADDRESS,
        defaultConditions
      ],
    });
    console.log("✅ Contract verified on Etherscan");
  } catch (error) {
    console.log("⚠️  Verification failed:", error);
  }

  // Lưu thông tin deploy
  const deployInfo = {
    contractAddress,
    priceFeed: ETH_USD_PRICE_FEED,
    poolAddress: POOL_ADDRESS,
    conditions: defaultConditions,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deploy Information:");
  console.log(JSON.stringify(deployInfo, null, 2));

  return {
    contractAddress,
    poolPauseAutomation
  };
}

// Chạy script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 