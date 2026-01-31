export const OPTION_BOOK_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "name": "maker", "type": "address" },
          { "name": "orderExpiryTimestamp", "type": "uint256" },
          { "name": "collateral", "type": "address" },
          { "name": "isCall", "type": "bool" },
          { "name": "priceFeed", "type": "address" },
          { "name": "implementation", "type": "address" },
          { "name": "isLong", "type": "bool" },
          { "name": "maxCollateralUsable", "type": "uint256" },
          { "name": "strikes", "type": "uint256[]" },
          { "name": "expiry", "type": "uint256" },
          { "name": "price", "type": "uint256" },
          { "name": "extraOptionData", "type": "bytes" }
        ],
        "name": "order",
        "type": "tuple"
      },
      { "name": "amount", "type": "uint256" },
      { "name": "referrer", "type": "address" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
      "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
      "name": "approve",
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [{ "name": "", "type": "bool" }]
  }
] as const;

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
