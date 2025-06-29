// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PriceAutomation
 * @dev Contract để tự động lấy giá token từ Uniswap pool
 */
contract PriceAutomation is AutomationCompatible {
    // Uniswap V2 Factory để tìm pool
    IUniswapV2Factory public immutable factory;
    
    // WETH address
    address public immutable WETH;
    
    // Token address để theo dõi giá
    address public token;
    
    // Thời gian bắt đầu automation (Unix timestamp)
    uint256 public startTime;
    
    // Thời gian kết thúc (30 phút sau startTime)
    uint256 public endTime;
    
    // Trạng thái automation
    bool public isActive;
    
    // Lưu trữ giá (timestamp => price)
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
     * @dev Cập nhật token để theo dõi giá
     * @param _token Địa chỉ token cần theo dõi
     */
    function setToken(address _token) external {
        if (_token == address(0)) revert InvalidToken();
        
        address oldToken = token;
        token = _token;
        
        // Kiểm tra pool tồn tại
        address pool = factory.getPair(_token, WETH);
        if (pool == address(0)) revert PoolNotFound();
        
        emit TokenUpdated(oldToken, _token);
    }
    
    /**
     * @dev Bắt đầu automation với thời gian cụ thể
     * @param _startTime Thời gian bắt đầu (Unix timestamp)
     */
    function startAutomation(uint256 _startTime) external {
        if (isActive) revert AutomationAlreadyStarted();
        if (_startTime <= block.timestamp) revert InvalidTimeRange();
        if (token == address(0)) revert InvalidToken();
        
        startTime = _startTime;
        endTime = _startTime + 30 minutes; // 30 phút sau
        isActive = true;
        
        emit AutomationStarted(startTime, endTime, token);
    }
    
    /**
     * @dev Chainlink Automation sẽ gọi function này để kiểm tra có cần thực hiện không
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        if (!isActive) return (false, "");
        
        uint256 currentTime = block.timestamp;
        
        // Nếu đã qua thời gian kết thúc, cần thực hiện để dừng automation
        if (currentTime > endTime) {
            return (true, "");
        }
        
        // Kiểm tra nếu đã đến thời gian bắt đầu và chưa qua thời gian kết thúc
        if (currentTime >= startTime && currentTime <= endTime) {
            // Chỉ lấy giá mỗi 5 phút để tránh spam
            if (currentTime % 300 == 0) {
                return (true, "");
            }
        }
        
        return (false, "");
    }
    
    /**
     * @dev Chainlink Automation sẽ gọi function này để thực hiện automation
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        if (!isActive) revert AutomationNotActive();
        
        uint256 currentTime = block.timestamp;
        
        // Nếu đã qua thời gian kết thúc, dừng automation
        if (currentTime > endTime) {
            isActive = false;
            emit AutomationCompleted();
            return;
        }
        
        // Lấy giá hiện tại từ Uniswap pool
        uint256 price = _getTokenPrice();
        
        // Lưu giá vào history
        priceHistory[currentTime] = price;
        timestamps.push(currentTime);
        
        emit PriceRecorded(currentTime, price);
    }
    
    /**
     * @dev Lấy giá token từ Uniswap pool (price in WETH)
     */
    function _getTokenPrice() internal view returns (uint256) {
        address pool = factory.getPair(token, WETH);
        if (pool == address(0)) revert PoolNotFound();
        
        IUniswapV2Pair pair = IUniswapV2Pair(pool);
        
        // Lấy reserves
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        // Xác định token0 và token1
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
        
        // Tính giá: WETH / Token
        if (tokenReserve == 0) return 0;
        
        // Lấy decimals của token
        uint8 tokenDecimals = IERC20(token).decimals();
        uint8 wethDecimals = IERC20(WETH).decimals();
        
        // Tính giá với precision cao
        return (wethReserve * (10 ** tokenDecimals)) / tokenReserve;
    }
    
    /**
     * @dev Lấy giá hiện tại từ Uniswap pool
     */
    function getCurrentPrice() external view returns (uint256) {
        return _getTokenPrice();
    }
    
    /**
     * @dev Lấy thông tin pool
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
     * @dev Lấy tất cả giá đã được ghi lại
     */
    function getAllPrices() external view returns (uint256[] memory timestampsArray, uint256[] memory prices) {
        timestampsArray = timestamps;
        prices = new uint256[](timestamps.length);
        
        for (uint256 i = 0; i < timestamps.length; i++) {
            prices[i] = priceHistory[timestamps[i]];
        }
    }
    
    /**
     * @dev Lấy giá tại timestamp cụ thể
     */
    function getPriceAt(uint256 timestamp) external view returns (uint256) {
        return priceHistory[timestamp];
    }
    
    /**
     * @dev Lấy số lượng giá đã ghi
     */
    function getPriceCount() external view returns (uint256) {
        return timestamps.length;
    }
    
    /**
     * @dev Dừng automation
     */
    function stopAutomation() external {
        isActive = false;
        emit AutomationCompleted();
    }
}
