# Chainlink Automation Integration

Dự án này tích hợp Chainlink Automation để tự động hóa các tác vụ blockchain, bao gồm:

1. **PriceAutomation**: Tự động lấy giá ETH từ Chainlink Price Feed
2. **PoolPauseAutomation**: Tự động pause/unpause pool swap dựa trên các điều kiện định nghĩa sẵn

## Cấu trúc Dự án

```
chainlink-integrator/
├── contracts/
│   ├── PriceAutomation.sol          # Contract lấy giá tự động
│   ├── PoolPauseAutomation.sol      # Contract pause pool tự động
│   └── mocks/
│       ├── MockAggregatorV3.sol     # Mock price feed cho test
│       └── MockPool.sol             # Mock pool cho test
├── scripts/
│   ├── deploy.ts                    # Deploy PriceAutomation
│   ├── deploy-pool-pause.ts         # Deploy PoolPauseAutomation
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

### Deploy PriceAutomation
```bash
npm run deploy
```

### Deploy PoolPauseAutomation
```bash
npm run deploy:pool-pause
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

### Sepolia Testnet
- **Price Feed**: `0x694AA1769357215DE4FAC081bf1f309aDC325306` (ETH/USD)
- **Automation Registry**: `0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2`

### Mainnet
- **Price Feed**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` (ETH/USD)
- **Automation Registry**: `0x02777053d6764996e594c3E88AF1D58D5363a2e6`

## Environment Variables

Tạo file `.env` với các biến sau:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Troubleshooting

### Lỗi thường gặp

1. **"AutomationNotActive"**: Automation chưa được bật
2. **"InvalidConditions"**: Điều kiện pause không hợp lệ
3. **"Unauthorized"**: Không phải owner

### Debug

```bash
# Xem logs chi tiết
npx hardhat test --verbose

# Test với network cụ thể
npx hardhat test --network sepolia
```

## Contributing

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
