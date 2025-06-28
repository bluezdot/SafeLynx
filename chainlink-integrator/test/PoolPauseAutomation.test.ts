import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { PoolPauseAutomationABI } from "../PoolPauseAutomationABI";

describe("PoolPauseAutomation", function () {
  let poolPauseAutomation: Contract;
  let mockPriceFeed: Contract;
  let mockPool: Contract;
  let owner: Signer;
  let user: Signer;
  let ownerAddress: string;
  let userAddress: string;

  // Mock data
  const mockPrice = ethers.parseEther("2000"); // $2000 USD
  const mockVolume = ethers.parseEther("500"); // 500 ETH
  const mockLiquidity = ethers.parseEther("2000"); // 2000 ETH

  // Default conditions
  const defaultConditions = {
    minPriceThreshold: ethers.parseEther("1000"),    // $1000 USD
    maxPriceThreshold: ethers.parseEther("5000"),    // $5000 USD
    minVolumeThreshold: ethers.parseEther("100"),    // 100 ETH
    maxVolumeThreshold: ethers.parseEther("10000"),  // 10000 ETH
    minLiquidityThreshold: ethers.parseEther("1000"), // 1000 ETH
    checkInterval: 300, // 5 phút
    isActive: true
  };

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    userAddress = await user.getAddress();

    // Deploy mock price feed
    const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
    mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.setPrice(mockPrice);

    // Deploy mock pool
    const MockPool = await ethers.getContractFactory("MockPool");
    mockPool = await MockPool.deploy();
    await mockPool.setVolume(mockVolume);
    await mockPool.setLiquidity(mockLiquidity);

    // Deploy PoolPauseAutomation
    const PoolPauseAutomation = await ethers.getContractFactory("PoolPauseAutomation");
    poolPauseAutomation = await PoolPauseAutomation.deploy(
      await mockPriceFeed.getAddress(),
      await mockPool.getAddress(),
      defaultConditions
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      expect(await poolPauseAutomation.priceFeed()).to.equal(await mockPriceFeed.getAddress());
      expect(await poolPauseAutomation.pool()).to.equal(await mockPool.getAddress());
      
      const conditions = await poolPauseAutomation.conditions();
      expect(conditions.minPriceThreshold).to.equal(defaultConditions.minPriceThreshold);
      expect(conditions.maxPriceThreshold).to.equal(defaultConditions.maxPriceThreshold);
      expect(conditions.minVolumeThreshold).to.equal(defaultConditions.minVolumeThreshold);
      expect(conditions.maxVolumeThreshold).to.equal(defaultConditions.maxVolumeThreshold);
      expect(conditions.minLiquidityThreshold).to.equal(defaultConditions.minLiquidityThreshold);
      expect(conditions.checkInterval).to.equal(defaultConditions.checkInterval);
      expect(conditions.isActive).to.equal(defaultConditions.isActive);
    });

    it("Should set owner correctly", async function () {
      expect(await poolPauseAutomation.owner()).to.equal(ownerAddress);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update conditions", async function () {
      const newConditions = {
        ...defaultConditions,
        minPriceThreshold: ethers.parseEther("1500"),
        maxPriceThreshold: ethers.parseEther("4000")
      };

      await expect(poolPauseAutomation.updateConditions(newConditions))
        .to.emit(poolPauseAutomation, "ConditionsUpdated");

      const conditions = await poolPauseAutomation.conditions();
      expect(conditions.minPriceThreshold).to.equal(newConditions.minPriceThreshold);
      expect(conditions.maxPriceThreshold).to.equal(newConditions.maxPriceThreshold);
    });

    it("Should not allow non-owner to update conditions", async function () {
      const newConditions = {
        ...defaultConditions,
        minPriceThreshold: ethers.parseEther("1500")
      };

      await expect(
        poolPauseAutomation.connect(user).updateConditions(newConditions)
      ).to.be.revertedWithCustomError(poolPauseAutomation, "Unauthorized");
    });

    it("Should allow owner to toggle automation", async function () {
      await expect(poolPauseAutomation.toggleAutomation())
        .to.emit(poolPauseAutomation, "AutomationStopped");

      let conditions = await poolPauseAutomation.conditions();
      expect(conditions.isActive).to.equal(false);

      await expect(poolPauseAutomation.toggleAutomation())
        .to.emit(poolPauseAutomation, "AutomationStarted");

      conditions = await poolPauseAutomation.conditions();
      expect(conditions.isActive).to.equal(true);
    });

    it("Should allow owner to update pool", async function () {
      const newPoolAddress = "0x1234567890123456789012345678901234567890";
      await poolPauseAutomation.updatePool(newPoolAddress);
      expect(await poolPauseAutomation.pool()).to.equal(newPoolAddress);
    });
  });

  describe("Condition Validation", function () {
    it("Should reject invalid price thresholds", async function () {
      const invalidConditions = {
        ...defaultConditions,
        minPriceThreshold: ethers.parseEther("5000"),
        maxPriceThreshold: ethers.parseEther("1000") // min > max
      };

      await expect(
        poolPauseAutomation.updateConditions(invalidConditions)
      ).to.be.revertedWithCustomError(poolPauseAutomation, "InvalidConditions");
    });

    it("Should reject invalid volume thresholds", async function () {
      const invalidConditions = {
        ...defaultConditions,
        minVolumeThreshold: ethers.parseEther("10000"),
        maxVolumeThreshold: ethers.parseEther("100") // min > max
      };

      await expect(
        poolPauseAutomation.updateConditions(invalidConditions)
      ).to.be.revertedWithCustomError(poolPauseAutomation, "InvalidConditions");
    });

    it("Should reject zero check interval", async function () {
      const invalidConditions = {
        ...defaultConditions,
        checkInterval: 0
      };

      await expect(
        poolPauseAutomation.updateConditions(invalidConditions)
      ).to.be.revertedWithCustomError(poolPauseAutomation, "InvalidConditions");
    });
  });

  describe("CheckUpkeep Logic", function () {
    it("Should return false when automation is inactive", async function () {
      await poolPauseAutomation.toggleAutomation(); // Turn off
      
      const [upkeepNeeded] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(false);
    });

    it("Should return false when not at check interval", async function () {
      // Mock block timestamp to not be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [100]);
      
      const [upkeepNeeded] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(false);
    });

    it("Should return true when conditions are met for pause", async function () {
      // Set price below threshold
      await mockPriceFeed.setPrice(ethers.parseEther("500")); // Below min threshold
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      // Decode performData
      const [price, volume, liquidity, shouldPause] = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint256", "uint256", "uint256", "bool"],
        performData
      );
      expect(shouldPause).to.equal(true);
    });

    it("Should return true when conditions are met for unpause", async function () {
      // First pause the pool
      await mockPool.pause();
      
      // Set all values within normal range
      await mockPriceFeed.setPrice(ethers.parseEther("2000"));
      await mockPool.setVolume(ethers.parseEther("500"));
      await mockPool.setLiquidity(ethers.parseEther("2000"));
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      // Decode performData
      const [price, volume, liquidity, shouldPause] = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint256", "uint256", "uint256", "bool"],
        performData
      );
      expect(shouldPause).to.equal(false);
    });
  });

  describe("PerformUpkeep Logic", function () {
    it("Should pause pool when conditions are met", async function () {
      // Set price below threshold
      await mockPriceFeed.setPrice(ethers.parseEther("500"));
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      await expect(poolPauseAutomation.performUpkeep(performData))
        .to.emit(poolPauseAutomation, "PoolPaused");
      
      expect(await mockPool.isPaused()).to.equal(true);
    });

    it("Should unpause pool when conditions return to normal", async function () {
      // First pause the pool
      await mockPool.pause();
      
      // Set all values within normal range
      await mockPriceFeed.setPrice(ethers.parseEther("2000"));
      await mockPool.setVolume(ethers.parseEther("500"));
      await mockPool.setLiquidity(ethers.parseEther("2000"));
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      expect(upkeepNeeded).to.equal(true);
      
      await expect(poolPauseAutomation.performUpkeep(performData))
        .to.emit(poolPauseAutomation, "PoolUnpaused");
      
      expect(await mockPool.isPaused()).to.equal(false);
    });

    it("Should not perform upkeep when automation is inactive", async function () {
      await poolPauseAutomation.toggleAutomation(); // Turn off
      
      const performData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "bool"],
        [mockPrice, mockVolume, mockLiquidity, true]
      );
      
      await expect(
        poolPauseAutomation.performUpkeep(performData)
      ).to.be.revertedWithCustomError(poolPauseAutomation, "AutomationNotActive");
    });
  });

  describe("Pause History", function () {
    it("Should record pause events correctly", async function () {
      // Set price below threshold
      await mockPriceFeed.setPrice(ethers.parseEther("500"));
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      await poolPauseAutomation.performUpkeep(performData);
      
      const pauseHistory = await poolPauseAutomation.getPauseHistory();
      expect(pauseHistory.length).to.equal(1);
      
      const event = pauseHistory[0];
      expect(event.timestamp).to.equal(300);
      expect(event.price).to.equal(ethers.parseEther("500"));
      expect(event.volume).to.equal(mockVolume);
      expect(event.liquidity).to.equal(mockLiquidity);
      expect(event.reason).to.equal("Price too low");
      expect(event.wasPaused).to.equal(true);
    });

    it("Should record unpause events correctly", async function () {
      // First pause the pool
      await mockPool.pause();
      
      // Set all values within normal range
      await mockPriceFeed.setPrice(ethers.parseEther("2000"));
      await mockPool.setVolume(ethers.parseEther("500"));
      await mockPool.setLiquidity(ethers.parseEther("2000"));
      
      // Mock block timestamp to be at interval
      await ethers.provider.send("evm_setNextBlockTimestamp", [300]);
      
      const [upkeepNeeded, performData] = await poolPauseAutomation.checkUpkeep("0x");
      await poolPauseAutomation.performUpkeep(performData);
      
      const pauseHistory = await poolPauseAutomation.getPauseHistory();
      expect(pauseHistory.length).to.equal(1);
      
      const event = pauseHistory[0];
      expect(event.timestamp).to.equal(300);
      expect(event.reason).to.equal("Auto unpause");
      expect(event.wasPaused).to.equal(false);
    });
  });

  describe("Current Status", function () {
    it("Should return correct current status", async function () {
      const status = await poolPauseAutomation.getCurrentStatus();
      
      expect(status.price).to.equal(mockPrice);
      expect(status.volume).to.equal(mockVolume);
      expect(status.liquidity).to.equal(mockLiquidity);
      expect(status.isPaused).to.equal(false);
      expect(status.shouldPause).to.equal(false); // All values are within normal range
    });

    it("Should detect when pause is needed", async function () {
      // Set price below threshold
      await mockPriceFeed.setPrice(ethers.parseEther("500"));
      
      const status = await poolPauseAutomation.getCurrentStatus();
      expect(status.shouldPause).to.equal(true);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple pause conditions", async function () {
      // Set multiple conditions to trigger pause
      await mockPriceFeed.setPrice(ethers.parseEther("6000")); // Above max
      await mockPool.setVolume(ethers.parseEther("50")); // Below min
      await mockPool.setLiquidity(ethers.parseEther("500")); // Below min
      
      const status = await poolPauseAutomation.getCurrentStatus();
      expect(status.shouldPause).to.equal(true);
    });

    it("Should handle boundary values", async function () {
      // Set values exactly at thresholds
      await mockPriceFeed.setPrice(defaultConditions.minPriceThreshold);
      await mockPool.setVolume(defaultConditions.minVolumeThreshold);
      await mockPool.setLiquidity(defaultConditions.minLiquidityThreshold);
      
      const status = await poolPauseAutomation.getCurrentStatus();
      expect(status.shouldPause).to.equal(false); // Should not pause at exact threshold
    });
  });
});

// Mock contracts for testing
describe("Mock Contracts", function () {
  it("Should deploy mock price feed", async function () {
    const MockPriceFeed = await ethers.getContractFactory("MockAggregatorV3");
    const mockPriceFeed = await MockPriceFeed.deploy();
    expect(await mockPriceFeed.getAddress()).to.be.properAddress;
  });

  it("Should deploy mock pool", async function () {
    const MockPool = await ethers.getContractFactory("MockPool");
    const mockPool = await MockPool.deploy();
    expect(await mockPool.getAddress()).to.be.properAddress;
  });
}); 