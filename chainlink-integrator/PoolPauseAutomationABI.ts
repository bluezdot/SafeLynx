export const PoolPauseAutomationABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_priceFeed",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_pool",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "minPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minLiquidityThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "checkInterval",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct PoolPauseAutomation.PauseConditions",
        "name": "_conditions",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AutomationNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidConditions",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PoolNotSet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      }
    ],
    "name": "PoolUnpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "PoolPaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "minPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minLiquidityThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "checkInterval",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "indexed": false,
        "internalType": "struct PoolPauseAutomation.PauseConditions",
        "name": "conditions",
        "type": "tuple"
      }
    ],
    "name": "ConditionsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "AutomationStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "AutomationStopped",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "checkUpkeep",
    "outputs": [
      {
        "internalType": "bool",
        "name": "upkeepNeeded",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "conditions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "minPriceThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxPriceThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minVolumeThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxVolumeThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minLiquidityThreshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "checkInterval",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pauseHistory",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "wasPaused",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "performUpkeep",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pool",
    "outputs": [
      {
        "internalType": "contract IPool",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "priceFeed",
    "outputs": [
      {
        "internalType": "contract AggregatorV3Interface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "minPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxPriceThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxVolumeThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minLiquidityThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "checkInterval",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct PoolPauseAutomation.PauseConditions",
        "name": "_conditions",
        "type": "tuple"
      }
    ],
    "name": "updateConditions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_pool",
        "type": "address"
      }
    ],
    "name": "updatePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleAutomation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPauseHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "volume",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "reason",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "wasPaused",
            "type": "bool"
          }
        ],
        "internalType": "struct PoolPauseAutomation.PauseEvent[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentStatus",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "volume",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isPaused",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "shouldPause",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const; 