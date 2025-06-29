// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PriceAutomation
 * @dev Contract to automatically fetch token price from Uniswap pool
 */
contract PriceAutomation is AutomationCompatible {
    // Uniswap V2 Factory to find pool
    IUniswapV2Factory public immutable factory;
    
    // WETH address
    address public immutable WETH;
    
    // Token address to monitor price
    address public token;
    
    // Automation start time (Unix timestamp)
    uint256 public startTime;
    
    // End time (30 minutes after startTime)
    uint256 public endTime;
    
    // Automation status
    bool public isActive;
    
    // Price storage (timestamp => price)
    mapping(uint256 => uint256) public priceHistory;
    uint256[] public timestamps;
    
    // Events
    event AutomationStarted(uint256 startTime, uint256 endTime, address token);
    event PriceRecorded(uint256 timestamp, uint256 price);
    event AutomationCompleted();
    event TokenUpdated(address oldToken, address newToken);
    
    // Errors
    error AutomationNotActive();
    error InvalidTimeRange();
    error AutomationAlreadyStarted();
    error PoolNotFound();
    error InvalidToken();
    
    constructor(address _factory, address _weth) {
        factory = IUniswapV2Factory(_factory);
        WETH = _weth;
    }
    
    /**
     * @dev Update token to monitor price
     * @param _token Token address to monitor
     */
    function setToken(address _token) external {
        if (_token == address(0)) revert InvalidToken();
        
        address oldToken = token;
        token = _token;
        
        // Check if pool exists
        address pool = factory.getPair(_token, WETH);
        if (pool == address(0)) revert PoolNotFound();
        
        emit TokenUpdated(oldToken, _token);
    }
    
    /**
     * @dev Start automation with specific time
     * @param _startTime Start time (Unix timestamp)
     */
    function startAutomation(uint256 _startTime) external {
        if (isActive) revert AutomationAlreadyStarted();
        if (_startTime <= block.timestamp) revert InvalidTimeRange();
        if (token == address(0)) revert InvalidToken();
        
        startTime = _startTime;
        endTime = _startTime + 30 minutes; // 30 minutes after
        isActive = true;
        
        emit AutomationStarted(startTime, endTime, token);
    }
    
    /**
     * @dev Chainlink Automation will call this function to check if execution is needed
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        if (!isActive) return (false, "");
        
        uint256 currentTime = block.timestamp;
        
        // If past end time, need to execute to stop automation
        if (currentTime > endTime) {
            return (true, "");
        }
        
        // Check if reached start time and not past end time
        if (currentTime >= startTime && currentTime <= endTime) {
            // Only fetch price every 5 minutes to avoid spam
            if (currentTime % 300 == 0) {
                return (true, "");
            }
        }
        
        return (false, "");
    }
    
    /**
     * @dev Chainlink Automation will call this function to execute automation
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        if (!isActive) revert AutomationNotActive();
        
        uint256 currentTime = block.timestamp;
        
        // If past end time, stop automation
        if (currentTime > endTime) {
            isActive = false;
            emit AutomationCompleted();
            return;
        }
        
        // Get current price from Uniswap pool
        uint256 price = _getTokenPrice();
        
        // Save price to history
        priceHistory[currentTime] = price;
        timestamps.push(currentTime);
        
        emit PriceRecorded(currentTime, price);
    }
    
    /**
     * @dev Get token price from Uniswap pool (price in WETH)
     */
    function _getTokenPrice() internal view returns (uint256) {
        address pool = factory.getPair(token, WETH);
        if (pool == address(0)) revert PoolNotFound();
        
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        
        // Get reserves
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        // Determine token0 and token1
        address token0 = pair.token0();
        
        uint256 tokenReserve;
        uint256 wethReserve;
        
        if (token == token0) {
            tokenReserve = reserve0;
            wethReserve = reserve1;
        } else {
            tokenReserve = reserve1;
            wethReserve = reserve0;
        }
        
        // Calculate price: WETH / Token
        if (tokenReserve == 0) return 0;
        
        // Get token decimals
        uint8 tokenDecimals = IERC20(token).decimals();
        uint8 wethDecimals = IERC20(WETH).decimals();
        
        // Calculate price with high precision
        return (wethReserve * (10 ** tokenDecimals)) / tokenReserve;
    }
    
    /**
     * @dev Get current price from Uniswap pool
     */
    function getCurrentPrice() external view returns (uint256) {
        return _getTokenPrice();
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo() external view returns (
        address pool,
        uint256 tokenReserve,
        uint256 wethReserve,
        uint256 price
    ) {
        pool = factory.getPair(token, WETH);
        if (pool == address(0)) revert PoolNotFound();
        
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        address token0 = pair.token0();
        
        if (token == token0) {
            tokenReserve = reserve0;
            wethReserve = reserve1;
        } else {
            tokenReserve = reserve1;
            wethReserve = reserve0;
        }
        
        price = _getTokenPrice();
    }
    
    /**
     * @dev Get all recorded prices
     */
    function getAllPrices() external view returns (uint256[] memory timestampsArray, uint256[] memory prices) {
        timestampsArray = timestamps;
        prices = new uint256[](timestamps.length);
        
        for (uint256 i = 0; i < timestamps.length; i++) {
            prices[i] = priceHistory[timestamps[i]];
        }
    }
    
    /**
     * @dev Get price at specific timestamp
     */
    function getPriceAt(uint256 timestamp) external view returns (uint256) {
        return priceHistory[timestamp];
    }
    
    /**
     * @dev Get number of recorded prices
     */
    function getPriceCount() external view returns (uint256) {
        return timestamps.length;
    }
    
    /**
     * @dev Stop automation
     */
    function stopAutomation() external {
        isActive = false;
        emit AutomationCompleted();
    }
}
