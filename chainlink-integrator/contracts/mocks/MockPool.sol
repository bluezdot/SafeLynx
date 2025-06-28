// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockPool
 * @dev Mock contract để test Pool interface
 */
contract MockPool {
    bool private _isPaused = false;
    uint256 private _volume24h;
    uint256 private _liquidity;
    
    constructor() {
        _volume24h = 500 * 10**18; // 500 ETH default
        _liquidity = 2000 * 10**18; // 2000 ETH default
    }
    
    function setVolume(uint256 volume) external {
        _volume24h = volume;
    }
    
    function setLiquidity(uint256 liquidity) external {
        _liquidity = liquidity;
    }
    
    function pause() external {
        _isPaused = true;
    }
    
    function unpause() external {
        _isPaused = false;
    }
    
    function isPaused() external view returns (bool) {
        return _isPaused;
    }
    
    function getVolume24h() external view returns (uint256) {
        return _volume24h;
    }
    
    function getLiquidity() external view returns (uint256) {
        return _liquidity;
    }
} 