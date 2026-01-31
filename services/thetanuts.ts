import { THETANUTS_CONFIG } from '../config/thetanuts';

// Types for API Response
export interface OptionQuote {
  strike: number;
  expiry: number; // Unix timestamp
  premium: number; // In USDC per contract
  impliedVol: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionChainData {
  asset: 'ETH' | 'BTC';
  currentPrice: number;
  quotes: OptionQuote[]; // Flat list of available quotes
}

// Mock Fallback Data (In case API fails or during dev)
const MOCK_CHAIN: OptionChainData = {
  asset: 'ETH',
  currentPrice: 3200,
  quotes: [
    { strike: 3000, expiry: Date.now()/1000 + 86400, premium: 15.5, impliedVol: 0.5, delta: 0.6, gamma: 0.01, theta: -0.5, vega: 0.2 },
    { strike: 3200, expiry: Date.now()/1000 + 86400, premium: 10.2, impliedVol: 0.45, delta: 0.5, gamma: 0.015, theta: -0.4, vega: 0.25 },
    { strike: 3400, expiry: Date.now()/1000 + 86400, premium: 5.8, impliedVol: 0.48, delta: 0.4, gamma: 0.01, theta: -0.3, vega: 0.15 },
  ]
};

export const ThetanutsService = {
  
  /**
   * Fetch Real OptionBook Data
   */
  fetchOptionBook: async (asset: 'ETH' | 'BTC' = 'ETH'): Promise<OptionChainData> => {
    try {
      // Note: The provided URL is a raw worker endpoint. 
      // We assume it returns a JSON with the full book.
      const res = await fetch(`${THETANUTS_CONFIG.API_URL_PRICING}/${asset}`, {
        next: { revalidate: 30 } // Cache for 30s
      });

      if (!res.ok) {
        throw new Error('Failed to fetch Thetanuts pricing');
      }

      const data = await res.json();
      
      // Transform API response to our format
      // Adjust this mapping based on ACTUAL API response structure found in logs
      // Map based on verified structure: data.data.orders
      const orders = data.data?.orders || [];
      const marketPrice = data.data?.market_data?.[asset];

      // console.log(`Fetched ${orders.length} orders for ${asset}`);

      return {
        asset,
        currentPrice: marketPrice || 0, 
        quotes: orders.map((item: any) => {
            const opt = item.order;
            // Strikes is an array, usually we take the first one or handle range
            const strikeRaw = opt.strikes ? opt.strikes[0] : 0;
            const strike = strikeRaw / 1e8; // Verified scaling (2600 * 1e8)

            return {
                strike: strike,
                expiry: opt.expiry, // Already unix timestamp
                // Premium usually in collateral decimals (USDC = 6)
                premium: parseFloat(opt.price) / 1e6, 
                impliedVol: 0, // Not provided in order book endpoint
                delta: 0,
                gamma: 0,
                theta: 0,
                vega: 0
            };
        })
      };

    } catch (error) {
      console.warn('Thetanuts API Error (using mock):', error);
      return MOCK_CHAIN; // Fail gracefully to mock
    }
  },

  /**
   * Fetch User Positions from Indexer
   */
  fetchUserPositions: async (address: string) => {
    try {
        const res = await fetch(`${THETANUTS_CONFIG.API_URL_INDEXER}/user/${address}/positions`);
        if(!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch positions", e);
        return [];
    }
  }
};
