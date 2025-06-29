# Chainlink Automation Integration

Dự án này tích hợp Chainlink Automation để tự động hóa các tác vụ blockchain, bao gồm:

1. **PriceAutomation**: Tự động lấy giá token từ Uniswap pool
2. **PoolPauseAutomation**: Tự động pause/unpause pool swap dựa trên các điều kiện định nghĩa sẵn

## Cấu trúc Dự án

```
chainlink-integrator/
├── contracts/
│   ├── PriceAutomation.sol          # Contract lấy giá từ Uniswap pool
│   ├── PoolPauseAutomation.sol      # Contract pause pool tự động
│   └── mocks/
│       ├── MockAggregatorV3.sol     # Mock price feed cho test
│       └── MockPool.sol             # Mock pool cho test
├── scripts/
│   ├── deploy.ts                    # Deploy PriceAutomation
│   ├── deploy-pool-pause.ts         # Deploy PoolPauseAutomation
│   ├── set-token-and-start.ts       # Set token và start automation
│   ├── register-automation.ts       # Register automation
│   └── start-automation.ts          # Start automation
├── test/
│   ├── PriceAutomation.test.ts      # Test PriceAutomation
│   └── PoolPauseAutomation.test.ts  # Test PoolPauseAutomation
└── README.md
```

## Cài đặt

```bash
npm install
```

## Compile Contracts

```bash
npm run compile
```

## Test

### Test tất cả contracts
```bash
npm run test
```

### Test chỉ PoolPauseAutomation
```bash
npm run test:pool-pause
```

## Deploy

### Deploy PriceAutomation (Base Sepolia)
```bash
npm run deploy
```

### Deploy PoolPauseAutomation (Base Sepolia)
```bash
npm run deploy:pool-pause
```

## PriceAutomation

Contract này tự động lấy giá token từ Uniswap V2 pool (token/WETH):

### Tính năng Chính

1. **Uniswap Integration**: Lấy giá trực tiếp từ Uniswap V2 pool
2. **Flexible Token**: Có thể thay đổi token để theo dõi
3. **Price History**: Lưu lịch sử giá theo timestamp
4. **Automation Control**: Bật/tắt automation theo lịch trình

### Cách hoạt động

1. **Deploy contract** với Uniswap V2 Factory và WETH address
2. **Set token** để theo dõi giá
3. **Start automation** với thời gian bắt đầu
4. **Chainlink Automation** sẽ tự động lấy giá mỗi 5 phút trong 30 phút

### Functions Chính

```solidity
// Set token để theo dõi
function setToken(address _token) external

// Bắt đầu automation
function startAutomation(uint256 _startTime) external

// Lấy giá hiện tại
function getCurrentPrice() external view returns (uint256)

// Lấy thông tin pool
function getPoolInfo() external view returns (
    address pool,
    uint256 tokenReserve,
    uint256 wethReserve,
    uint256 price
)

// Lấy tất cả giá đã ghi
function getAllPrices() external view returns (uint256[] memory, uint256[] memory)
```

### Setup Workflow

```bash
# 1. Deploy contract
npm run deploy

# 2. Set token và start automation (cần edit script trước)
npx hardhat run scripts/set-token-and-start.ts --network baseSepolia

# 3. Register automation
npm run register
```

## PoolPauseAutomation

Contract này tự động pause/unpause pool swap dựa trên các điều kiện:

### Điều kiện Pause
- **Giá**: Khi giá ETH vượt quá ngưỡng min/max
- **Volume**: Khi volume 24h vượt quá ngưỡng min/max  
- **Liquidity**: Khi liquidity dưới ngưỡng tối thiểu
- **Interval**: Kiểm tra mỗi X giây (có thể cấu hình)

### Cấu hình Mặc định
```javascript
{
  minPriceThreshold: "1000",     // $1000 USD
  maxPriceThreshold: "5000",     // $5000 USD
  minVolumeThreshold: "100",     // 100 ETH
  maxVolumeThreshold: "10000",   // 10000 ETH
  minLiquidityThreshold: "1000", // 1000 ETH
  checkInterval: 300,            // 5 phút
  isActive: true
}
```

### Tính năng Chính

1. **Access Control**: Chỉ owner có thể cập nhật cấu hình
2. **Flexible Conditions**: Có thể cập nhật điều kiện pause
3. **History Tracking**: Lưu lịch sử các lần pause/unpause
4. **Status Monitoring**: Kiểm tra trạng thái hiện tại
5. **Automation Control**: Bật/tắt automation

### Functions Chính

```solidity
// Cập nhật điều kiện pause
function updateConditions(PauseConditions memory _conditions) external onlyOwner

// Bật/tắt automation
function toggleAutomation() external onlyOwner

// Cập nhật pool address
function updatePool(address _pool) external onlyOwner

// Lấy lịch sử pause
function getPauseHistory() external view returns (PauseEvent[] memory)

// Lấy trạng thái hiện tại
function getCurrentStatus() external view returns (
    uint256 price,
    uint256 volume,
    uint256 liquidity,
    bool isPaused,
    bool shouldPause
)
```

## Chainlink Automation

### Register Automation
```bash
npm run register
```

### Start Automation
```bash
npm run start-automation
```

## Networks

### Base Sepolia Testnet (Primary)
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Uniswap V2 Factory**: `0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6`
- **WETH**: `0x4200000000000000000000000000000000000006`
- **Chainlink Price Feed (ETH/USD)**: `0x4aDC67696bA383c43E60E1154C7d5e5c3c243d2c`
- **Automation Registry**: `0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2`
- **Explorer**: https://sepolia.basescan.org

### Sepolia Testnet
- **Uniswap V2 Factory**: `0x7E0987E5b3a30e3f2828572Bb659A548460a3003`
- **WETH**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`
- **Automation Registry**: `0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2`

### Mainnet
- **Uniswap V2 Factory**: `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`
- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- **Automation Registry**: `0x02777053d6764996e594c3E88AF1D58D5363a2e6`

## Environment Variables

Tạo file `.env` với các biến sau:

```env
# Private key (không có 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
BASE_RPC_URL=https://mainnet.base.org

# API Keys cho verification
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Faucets & Test Tokens

### Base Sepolia
- **ETH Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **LINK Faucet**: https://faucets.chain.link/base-sepolia

## Troubleshooting

### Lỗi thường gặp

1. **"PoolNotFound"**: Token chưa có pool Uniswap V2 với WETH
2. **"InvalidToken"**: Địa chỉ token không hợp lệ
3. **"AutomationNotActive"**: Automation chưa được bật
4. **"InvalidConditions"**: Điều kiện pause không hợp lệ
5. **"Unauthorized"**: Không phải owner

### Debug

```bash
# Xem logs chi tiết
npx hardhat test --verbose

# Test với network cụ thể
npx hardhat test --network baseSepolia

# Kiểm tra pool info
npx hardhat console --network baseSepolia
> const contract = await ethers.getContractAt("PriceAutomation", "CONTRACT_ADDRESS")
> await contract.getPoolInfo()
```

## Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
