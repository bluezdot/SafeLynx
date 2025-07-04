# 🚀 SafeLynx - Decentralized Token Launchpad with anti-rug mechanism

> **Revolutionizing DeFi on @base with anti-rug mechanism**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Base](https://img.shields.io/badge/Base-0052FF?style=flat&logo=base&logoColor=white)](https://base.org/)

## 🎯 Project Overview

SafeLynx is a comprehensive launchpad that combines the power of Doppler V3 liquidity bootstrapping protocol with advanced Chainlink Toolkits for intelligent token launching and risk management. Built on Base network, SafeLynx provides a secure, efficient, and user-friendly environment for token creators and liquidity providers. By embedding fairness, transparency, and protection at the protocol level, we’re building a launchpad where:

- Creators earn success by proving traction
- Users participate without fear of losing everything
- Market integrity is protected, not exploited

## 🔄 Flow Overview

![SafeLynx Flow](flow.png)

SafeLynx implements a sophisticated anti-rug mechanism through a bonding curve system with automated price challenges. The flow begins when a creator deploys a token and initializes the bonding curve, allowing users to participate in the token launch. After the bonding period ends, Chainlink Automation monitors a 30-minute window before triggering a price challenge that compares the current market price against the bonding average. If the price challenge succeeds (≥1.5x bonding average), tokens are unlocked for users and rewards are distributed to creators. If the challenge fails, an automated refund process is triggered, protecting users from potential losses.

### 🌟 Key Features

- **🚀 Smart Token Launching**: Automated token deployment with Doppler V3 protocol
- **🤖 Liquidity Management**: Chainlink automation for intelligent pool management
- **📊 Real-time Analytics**: Advanced charts and market insights
- **🔒 Security First**: Multi-layer security with automated risk management
- **⚡ High Performance**: Built on Base network for fast and cost-effective transactions
- **🎨 Modern UI/UX**: Intuitive interface for seamless DeFi experience

## 🏗️ Architecture

```
SafeLynx/
├── 🎨 sl-app/                 # Frontend React Application
│   ├── Token Deployment      # Doppler V3 integration
│   ├── Trading Interface     # Real-time trading
│   ├── Analytics Dashboard   # Market insights
│   └── Liquidity Management  # Pool management tools
├── 🔍 sl-indexer/            # Blockchain Indexing Service
│   ├── Multi-chain Support   # Ethereum, Base, Unichain
│   ├── Real-time Events      # Live blockchain data
│   └── GraphQL API          # Query interface
└── ⚙️ chainlink-integrator/  # Automation Services
    ├── Price Automation      # Real-time price monitoring
    └── Pool Pause Logic      # Risk management automation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.14+
- Yarn package manager
- Docker & Docker Compose
- Base Sepolia testnet ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/SafeLynx.git
cd SafeLynx

# Install dependencies for all packages
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Start the frontend application
cd sl-app
yarn dev

# Start the indexer service
cd sl-indexer
yarn dev

# Start Chainlink automation (optional)
cd chainlink-integrator
yarn compile
yarn deploy
```

[//]: # (## 🛠️ Technology Stack)

[//]: # ()
[//]: # (### Frontend)

[//]: # (- **React 18** - Modern UI framework)

[//]: # (- **TypeScript** - Type-safe development)

[//]: # (- **Vite** - Fast build tool)

[//]: # (- **Tailwind CSS** - Utility-first styling)

[//]: # (- **Radix UI** - Accessible components)

[//]: # (- **Wagmi** - React hooks for Ethereum)

[//]: # (- **Viem** - TypeScript interface for Ethereum)

[//]: # ()
[//]: # (### Backend & Infrastructure)

[//]: # (- **Ponder** - Blockchain indexing framework)

[//]: # (- **PostgreSQL** - Database)

[//]: # (- **GraphQL** - API layer)

[//]: # (- **Docker** - Containerization)

[//]: # (- **Base Network** - L2 scaling solution)

[//]: # ()
[//]: # (### Smart Contracts & Automation)

[//]: # (- **Doppler V3 SDK** - Liquidity bootstrapping)

[//]: # (- **Chainlink Automation** - Decentralized automation)

[//]: # (- **Uniswap V2/V3/V4** - DEX integration)

[//]: # (- **Solidity** - Smart contract language)

[//]: # (## 🎮 Demo & Usage)

[//]: # ()
[//]: # (### Deploying a New Token)

[//]: # ()
[//]: # (1. **Navigate to Deploy Page**)

[//]: # (   - Visit `/deploy` in the application)

[//]: # (   - Connect your wallet)

[//]: # ()
[//]: # (2. **Configure Token Parameters**)

[//]: # (   - Token name and symbol)

[//]: # (   - Initial supply and distribution)

[//]: # (   - Liquidity parameters)

[//]: # (   - Advanced options &#40;tick spacing, positions&#41;)

[//]: # ()
[//]: # (3. **Launch Token**)

[//]: # (   - Review configuration)

[//]: # (   - Confirm transaction)

[//]: # (   - Monitor deployment progress)

[//]: # ()
[//]: # (### Trading & Liquidity Management)

[//]: # ()
[//]: # (1. **View Token Details**)

[//]: # (   - Navigate to `/doppler-v2/:tokenAddress`)

[//]: # (   - View real-time price charts)

[//]: # (   - Check liquidity distribution)

[//]: # ()
[//]: # (2. **Execute Trades**)

[//]: # (   - Buy/sell tokens)

[//]: # (   - Set slippage tolerance)

[//]: # (   - Confirm transactions)

## 🔧 Development

### Project Structure

```
SafeLynx/
├── sl-app/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── sl-indexer/               # Blockchain indexer
│   ├── src/
│   │   ├── indexer/         # Indexing logic
│   │   ├── config/          # Configuration
│   │   └── types/           # Type definitions
│   └── docker-compose.yml   # Docker configuration
└── chainlink-integrator/     # Automation contracts
    ├── contracts/           # Smart contracts
    ├── scripts/             # Deployment scripts
    └── test/                # Test files
```

[//]: # (### Available Scripts)

[//]: # ()
[//]: # (```bash)

[//]: # (# Frontend &#40;sl-app&#41;)

[//]: # (yarn dev          # Start development server)

[//]: # (yarn build        # Build for production)

[//]: # (yarn lint         # Run linter)

[//]: # ()
[//]: # (# Indexer &#40;sl-indexer&#41;)

[//]: # (yarn dev          # Start indexer)

[//]: # (yarn start        # Start production indexer)

[//]: # (yarn db           # Database operations)

[//]: # ()
[//]: # (# Smart Contracts &#40;chainlink-integrator&#41;)

[//]: # (yarn compile      # Compile contracts)

[//]: # (yarn test         # Run tests)

[//]: # (yarn deploy       # Deploy contracts)

[//]: # (```)

## 🔒 Security Features

- **Automated Risk Management**: Chainlink automation for pool pause/unpause
- **Price Monitoring**: Real-time price feeds with fallback mechanisms
- **Liquidity Protection**: Automated liquidity management
- **Access Control**: Role-based permissions
- **Audit Ready**: Clean, documented codebase

## 🌐 Network Support

- **Base Sepolia** - Primary development network
- **Base Mainnet** - Full compatibility (Coming soon)
- **Ethereum Mainnet** - Full compatibility (Coming soon)
- **Unichain** - Full compatibility (Coming soon)

## 🤝 Contributing

We welcome contributions! Please create an issue and tag @bluezdot or @luthebao.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Doppler Protocol** - For the amazing liquidity bootstrapping protocol
- **Chainlink** - For decentralized automation infrastructure
- **Base Network** - For scalable L2 solution
- **Uniswap** - For DEX infrastructure
- **Ponder** - For blockchain indexing framework

## 📞 Contact & Support

- **Website**: [https://safelynx.xyz](https://safelynx.xyz)
- **Documentation**: [Draft Documentation](https://www.notion.so/Hackathon-SafeLynX-21b87a3971668080ba8efde192c504ac)
- **Twitter**: [@SafeLynx_xyz](https://x.com/SafeLynx_xyz)

## 🏆 Hackathon Submission

This project was built for **Chromion: A Chainlink Hackathon 2025** with the goal of revolutionizing DeFi token launching, liquidity and risk management. We believe in the power of decentralized finance to democratize access to financial services and create more inclusive economic systems.

### 🎯 Problem Statement

Traditional token launching is fraught with challenges:
- High gas costs and network congestion
- Lack of automated risk management
- Poor user experience
- Centralized control and manipulation
- High probability of rug-pull
- High risk of losing funds

### 💡 Our Solution

SafeLynx addresses these challenges by:
- Leveraging Base network for cost-effective transactions
- Implementing Chainlink automation for intelligent risk management
- Providing intuitive UI/UX for seamless token operations
- Ensuring decentralization and transparency
- Applying price challenge to guarantee profits
- Providing claimable refunds

### 🚀 Future Roadmap

- [ ] Cross-chain liquidity bridges
- [ ] Bubblemaps and Rugcheck integration
- [ ] Advanced AI-powered analytics
- [ ] Mobile application
- [ ] DAO governance integration
- [ ] Institutional-grade features
