import { base } from 'viem/chains';

// --- THETANUTS v4 CONFIG (BASE MAINNET) ---
export const THETANUTS_CONFIG = {
  // API Endpoints
  API_URL_PRICING: 'https://round-snowflake-9c31.devops-118.workers.dev', // OptionBook Pricing
  API_URL_INDEXER: 'https://api.thetanuts.finance/v1', // User Positions (Verified from Docs)

  // Contract Addresses (Base Mainnet)
  // Note: These should be verified from official docs/API response. 
  // Contract Addresses (Base Mainnet)
  // Verified from Thetanuts V4 Docs/Explorer
  GENERIC_OPTION_BOOK: '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1', 

  // Assets
  ASSETS: {
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
      decimals: 6,
      symbol: 'USDC'
    },
    WETH: {
      address: '0x4200000000000000000000000000000000000006', // WETH on Base
      decimals: 18,
      symbol: 'WETH'
    },
    CBETH: {
       address: '0xbe9895146f7af43049ca1c1ae358b0541ea49704', 
       decimals: 18,
       symbol: 'cbBTC' // Using cbBTC based on docs mention
    }
  },

  // Biconomy Paymaster (Gas Subsidy)
  PAYMASTER: {
    API_KEY: process.env.NEXT_PUBLIC_BICONOMY_API_KEY || '', 
    BUNDLER_URL: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || `https://bundler.biconomy.io/api/v2/8453/${process.env.ID_BICONOMY || '0641785f-bd22-4446-9075-294901a1cd29'}` 
  },

  // App Settings
  REFERRER_ADDRESS: process.env.NEXT_PUBLIC_THETANUTS_REFERRER_ADDRESS || '0x0000000000000000000000000000000000000000', 
  MIN_ORDER_AMOUNT: 0.0001 // USDC
};

export const CHAIN_CONFIG = base;
