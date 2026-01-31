import { Address } from 'viem';

// --- ADDRESSES (Base Mainnet) ---
export const OPTION_BOOK_ADDRESS = '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// --- ABIS ---

// Minimal OptionBook ABI for fillOrder
export const OPTION_BOOK_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "maker", "type": "address" },
          { "internalType": "uint256", "name": "orderExpiryTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "collateral", "type": "address" },
          { "internalType": "bool", "name": "isCall", "type": "bool" },
          { "internalType": "address", "name": "priceFeed", "type": "address" },
          { "internalType": "address", "name": "implementation", "type": "address" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "maxCollateralUsable", "type": "uint256" },
          { "internalType": "uint256[]", "name": "strikes", "type": "uint256[]" },
          { "internalType": "uint256", "name": "expiry", "type": "uint256" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "numContracts", "type": "uint256" },
          { "internalType": "bytes", "name": "extraOptionData", "type": "bytes" }
        ],
        "internalType": "struct IOptionBook.Order",
        "name": "order",
        "type": "tuple"
      },
      { "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "internalType": "uint256", "name": "numContracts", "type": "uint256" },
      { "internalType": "address", "name": "referrer", "type": "address" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Minimal ERC20 ABI for Approval
export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export type ThetanutsOrder = {
  maker: Address;
  orderExpiryTimestamp: bigint;
  collateral: Address;
  isCall: boolean;
  priceFeed: Address;
  implementation: Address;
  isLong: boolean;
  maxCollateralUsable: bigint;
  strikes: readonly bigint[];
  expiry: bigint;
  price: bigint;
  numContracts: bigint;
  extraOptionData: `0x${string}`;
};
