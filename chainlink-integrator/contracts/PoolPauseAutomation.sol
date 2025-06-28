// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * @title PoolPauseAutomation
 * @dev Contract để tự động pause pool swap dựa trên các điều kiện giá và volume
 */
contract PoolPauseAutomation is AutomationCompatible, ConfirmedOwner {
    // Chainlink Price Feed cho ETH/USD
    AggregatorV3Interface public immutable priceFeed;
    
    // Pool interface (giả định có interface pause)
    interface IPool {
        function pause() external;
        function unpause() external;
        function isPaused() external view returns (bool);
        function getVolume24h() external view returns (uint256);
        function getLiquidity() external view returns (uint256);
    }
    
    // Pool address
    IPool public pool;
    
    // Cấu hình điều kiện pause
    struct PauseConditions {
        uint256 minPriceThreshold;    // Giá tối thiểu để pause (wei)
        uint256 maxPriceThreshold;    // Giá tối đa để pause (wei)
        uint256 minVolumeThreshold;   // Volume tối thiểu để pause
        uint256 maxVolumeThreshold;   // Volume tối đa để pause
        uint256 minLiquidityThreshold; // Liquidity tối thiểu để pause
        uint256 checkInterval;        // Khoảng thời gian giữa các lần check (giây)
        bool isActive;                // Trạng thái automation
    }
    
    PauseConditions public conditions;
    
    // Lịch sử pause
    struct PauseEvent {
        uint256 timestamp;
        uint256 price;
        uint256 volume;
        uint256 liquidity;
        string reason;
        bool wasPaused;
    }
    
    PauseEvent[] public pauseHistory;
    
    // Events
    event PoolPaused(uint256 timestamp, uint256 price, uint256 volume, uint256 liquidity, string reason);
    event PoolUnpaused(uint256 timestamp, uint256 price, uint256 volume, uint256 liquidity);
    event ConditionsUpdated(PauseConditions conditions);
    event AutomationStarted();
    event AutomationStopped();
    
    // Errors
    error AutomationNotActive();
    error InvalidConditions();
    error PoolNotSet();
    error Unauthorized();
    
    constructor(
        address _priceFeed,
        address _pool,
        PauseConditions memory _conditions
    ) ConfirmedOwner(msg.sender) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        pool = IPool(_pool);
        _validateConditions(_conditions);
        conditions = _conditions;
    }
    
    /**
     * @dev Cập nhật điều kiện pause
     */
    function updateConditions(PauseConditions memory _conditions) external onlyOwner {
        _validateConditions(_conditions);
        conditions = _conditions;
        emit ConditionsUpdated(_conditions);
    }
    
    /**
     * @dev Bật/tắt automation
     */
    function toggleAutomation() external onlyOwner {
        conditions.isActive = !conditions.isActive;
        if (conditions.isActive) {
            emit AutomationStarted();
        } else {
            emit AutomationStopped();
        }
    }
    
    /**
     * @dev Cập nhật pool address
     */
    function updatePool(address _pool) external onlyOwner {
        pool = IPool(_pool);
    }
    
    /**
     * @dev Chainlink Automation check function
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        if (!conditions.isActive) return (false, "");
        
        // Kiểm tra interval
        if (block.timestamp % conditions.checkInterval != 0) {
            return (false, "");
        }
        
        // Lấy dữ liệu hiện tại
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 currentPrice = uint256(price);
        uint256 currentVolume = pool.getVolume24h();
        uint256 currentLiquidity = pool.getLiquidity();
        bool isCurrentlyPaused = pool.isPaused();
        
        // Kiểm tra điều kiện pause
        bool shouldPause = _shouldPause(currentPrice, currentVolume, currentLiquidity);
        bool shouldUnpause = _shouldUnpause(currentPrice, currentVolume, currentLiquidity);
        
        if ((shouldPause && !isCurrentlyPaused) || (shouldUnpause && isCurrentlyPaused)) {
            return (true, abi.encode(currentPrice, currentVolume, currentLiquidity, shouldPause));
        }
        
        return (false, "");
    }
    
    /**
     * @dev Chainlink Automation perform function
     */
    function performUpkeep(bytes calldata performData) external override {
        if (!conditions.isActive) revert AutomationNotActive();
        
        (uint256 price, uint256 volume, uint256 liquidity, bool shouldPause) = 
            abi.decode(performData, (uint256, uint256, uint256, bool));
        
        if (shouldPause) {
            pool.pause();
            string memory reason = _getPauseReason(price, volume, liquidity);
            _recordPauseEvent(price, volume, liquidity, reason, true);
            emit PoolPaused(block.timestamp, price, volume, liquidity, reason);
        } else {
            pool.unpause();
            _recordPauseEvent(price, volume, liquidity, "Auto unpause", false);
            emit PoolUnpaused(block.timestamp, price, volume, liquidity);
        }
    }
    
    /**
     * @dev Kiểm tra xem có nên pause không
     */
    function _shouldPause(
        uint256 price,
        uint256 volume,
        uint256 liquidity
    ) internal view returns (bool) {
        return (
            price < conditions.minPriceThreshold ||
            price > conditions.maxPriceThreshold ||
            volume < conditions.minVolumeThreshold ||
            volume > conditions.maxVolumeThreshold ||
            liquidity < conditions.minLiquidityThreshold
        );
    }
    
    /**
     * @dev Kiểm tra xem có nên unpause không
     */
    function _shouldUnpause(
        uint256 price,
        uint256 volume,
        uint256 liquidity
    ) internal view returns (bool) {
        return (
            price >= conditions.minPriceThreshold &&
            price <= conditions.maxPriceThreshold &&
            volume >= conditions.minVolumeThreshold &&
            volume <= conditions.maxVolumeThreshold &&
            liquidity >= conditions.minLiquidityThreshold
        );
    }
    
    /**
     * @dev Lấy lý do pause
     */
    function _getPauseReason(
        uint256 price,
        uint256 volume,
        uint256 liquidity
    ) internal view returns (string memory) {
        if (price < conditions.minPriceThreshold) return "Price too low";
        if (price > conditions.maxPriceThreshold) return "Price too high";
        if (volume < conditions.minVolumeThreshold) return "Volume too low";
        if (volume > conditions.maxVolumeThreshold) return "Volume too high";
        if (liquidity < conditions.minLiquidityThreshold) return "Liquidity too low";
        return "Unknown";
    }
    
    /**
     * @dev Ghi lại sự kiện pause
     */
    function _recordPauseEvent(
        uint256 price,
        uint256 volume,
        uint256 liquidity,
        string memory reason,
        bool wasPaused
    ) internal {
        pauseHistory.push(PauseEvent({
            timestamp: block.timestamp,
            price: price,
            volume: volume,
            liquidity: liquidity,
            reason: reason,
            wasPaused: wasPaused
        }));
    }
    
    /**
     * @dev Validate điều kiện
     */
    function _validateConditions(PauseConditions memory _conditions) internal pure {
        if (_conditions.minPriceThreshold >= _conditions.maxPriceThreshold) {
            revert InvalidConditions();
        }
        if (_conditions.minVolumeThreshold >= _conditions.maxVolumeThreshold) {
            revert InvalidConditions();
        }
        if (_conditions.checkInterval == 0) {
            revert InvalidConditions();
        }
    }
    
    /**
     * @dev Lấy lịch sử pause
     */
    function getPauseHistory() external view returns (PauseEvent[] memory) {
        return pauseHistory;
    }
    
    /**
     * @dev Lấy thông tin hiện tại
     */
    function getCurrentStatus() external view returns (
        uint256 price,
        uint256 volume,
        uint256 liquidity,
        bool isPaused,
        bool shouldPause
    ) {
        (, int256 currentPrice, , , ) = priceFeed.latestRoundData();
        price = uint256(currentPrice);
        volume = pool.getVolume24h();
        liquidity = pool.getLiquidity();
        isPaused = pool.isPaused();
        shouldPause = _shouldPause(price, volume, liquidity);
    }
} 