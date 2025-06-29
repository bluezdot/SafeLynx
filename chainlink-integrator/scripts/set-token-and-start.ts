import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Setting token and starting automation...");

  // Lấy signer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Contract address (cần thay đổi sau khi deploy)
  const CONTRACT_ADDRESS = "0x..."; // Thay bằng address thực tế
  const TOKEN_ADDRESS = "0x..."; // Thay bằng token address thực tế

  // Lấy contract instance
  const PriceAutomation = await ethers.getContractFactory("PriceAutomation");
  const priceAutomation = PriceAutomation.attach(CONTRACT_ADDRESS);

  console.log("📊 Contract address:", CONTRACT_ADDRESS);
  console.log("🪙 Token address:", TOKEN_ADDRESS);

  try {
    // Set token
    console.log("\n🔧 Setting token...");
    const setTokenTx = await priceAutomation.setToken(TOKEN_ADDRESS);
    await setTokenTx.wait();
    console.log("✅ Token set successfully");

    // Kiểm tra pool info
    console.log("\n📊 Getting pool info...");
    const poolInfo = await priceAutomation.getPoolInfo();
    console.log("🏊 Pool address:", poolInfo.pool);
    console.log("🪙 Token reserve:", ethers.formatEther(poolInfo.tokenReserve));
    console.log("💎 WETH reserve:", ethers.formatEther(poolInfo.wethReserve));
    console.log("💰 Current price:", ethers.formatEther(poolInfo.price), "WETH per token");

    // Tính thời gian bắt đầu (5 phút từ bây giờ)
    const startTime = Math.floor(Date.now() / 1000) + 300; // 5 phút
    console.log("\n⏰ Start time:", new Date(startTime * 1000).toISOString());

    // Start automation
    console.log("\n🚀 Starting automation...");
    const startTx = await priceAutomation.startAutomation(startTime);
    await startTx.wait();
    console.log("✅ Automation started successfully");

    // Kiểm tra trạng thái
    console.log("\n📋 Automation status:");
    console.log("Active:", await priceAutomation.isActive());
    console.log("Start time:", await priceAutomation.startTime());
    console.log("End time:", await priceAutomation.endTime());
    console.log("Token:", await priceAutomation.token());

    console.log("\n🎉 Setup completed! Automation will start in 5 minutes.");
    console.log("📝 Next step: Register automation with Chainlink");

  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error.message.includes("PoolNotFound")) {
      console.log("💡 Tip: Make sure the token has a Uniswap V2 pool with WETH");
      console.log("💡 Base Sepolia WETH: 0x4200000000000000000000000000000000000006");
    }
    
    if (error.message.includes("InvalidToken")) {
      console.log("💡 Tip: Make sure the token address is valid");
    }
  }
}

// Chạy script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 