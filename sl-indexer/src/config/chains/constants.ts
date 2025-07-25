import { Address } from "viem";
import { OracleAddresses } from "./types";

export const CHAIN_IDS = {
    mainnet: 1,
    baseSepolia: 84532,
} as const;

// Block numbers organized by purpose
export const START_BLOCKS = {
    mainnet: 22700000,
    baseSepolia:
        27059000,
} as const;

export const V4_START_BLOCKS = {
    baseSepolia: 27059000,
} as const;

// Special contract addresses used across chains
export const COMMON_ADDRESSES = {
    WETH_BASE: "0x4200000000000000000000000000000000000006" as Address,
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000" as Address,
} as const;

// Oracle addresses (mainnet-based)
export const ORACLE_ADDRESSES: OracleAddresses = {
    mainnetEthUsdc: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640" as Address,
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    chainlinkEth: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as Address,
};

// RPC environment variable mapping
export const RPC_ENV_VARS = {
    mainnet: "PONDER_RPC_URL_1",
    baseSepolia: "PONDER_RPC_URL_84532",
} as const;