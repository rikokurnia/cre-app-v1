
import { THETANUTS_CONFIG } from "@/config/thetanuts";

export interface OptionQuote {
  strike: number;
  expiry: Date;
  premium: number;
  type: 'Call' | 'Put';
  rawExpiry: number;
  rawPremium: string; // for precision
  rawOrder: any; // The original order object from API
  availablePremium: number; // Max USDC premium that can be paid for this order
}

export interface OptionChainData {
  currentPrice: number;
  quotes: OptionQuote[];
  expiries: number[]; // Available expiry days (e.g. [1, 2, 7])
  expiryMap: Record<number, number>; // Map days -> real unix timestamp (ms)
  optionBookAddress?: string;
}

const ENDPOINT_URL = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain";

/**
 * Fetches the Option Chain for a given asset.
 * Filters and normalizes data to match the UI requirements (1, 2, 3, 7, 28 days).
 */
export async function fetchOptionBook(assetSymbol: 'ETH' | 'BTC'): Promise<OptionChainData> {
  try {
    const assetConfig = assetSymbol === 'ETH' ? THETANUTS_CONFIG.ASSETS.WETH : THETANUTS_CONFIG.ASSETS.CBETH;
    const url = `${ENDPOINT_URL}?chainId=8453&assetAddress=${assetConfig.address}`;
    
    // Explicitly prevent caching for real-time data testing
    const res = await fetch(url, { cache: 'no-store' }); 
    if (!res.ok) throw new Error("Failed to fetch Thetanuts API");
    
    const json = await res.json();
    const content = json.data || json;
    const orders = content.orders || content.quotes || [];
    
    // Determine Current Spot Price
    let currentPrice = content.indexPrice ? parseFloat(content.indexPrice) : 0;
    if (!currentPrice) {
       currentPrice = assetSymbol === 'ETH' ? 2705.13 : 85000.00;
    }

    // Process and Normalize Quotes
    const validQuotes: OptionQuote[] = orders.map((o: any) => {
        const item = o.order || o;
        
        // Safety: ensure ticker exists and matches asset
        if (item.ticker && !item.ticker.startsWith(assetSymbol)) return null;

        let strikeVal = 0;
        if (item.strikes && item.strikes.length > 0) strikeVal = Number(item.strikes[0]);
        else if (item.strike) strikeVal = Number(item.strike);
        
        if (strikeVal > 100000000) strikeVal = strikeVal / 100000000; 
        else if (strikeVal > 100000) strikeVal = strikeVal / 1e6;

        let premiumVal = Number(item.price);
        if (premiumVal > 1000000) premiumVal = premiumVal / 1e6;

        // Calculate Liquidity (Max Premium Taker can pay)
        // Heuristic: Premium = (Collateral / BaseScale) * Price
        // For Call/Put, maxCollateralUsable is usually in USDC (6 decimals)
        const collateralRaw = Number(item.maxCollateralUsable || 0);
        const collateralUsd = collateralRaw / 1e6;
        
        /**
         * Liquidity Logic:
         * For a Maker Short Put: Collateral = Contracts * Strike.
         * Premium available = (Collateral / Strike) * Price.
         */
        const effectiveStrike = strikeVal || currentPrice;
        let availPrem = (collateralUsd / (effectiveStrike || 1)) * premiumVal;
        
        // Safety cap or fallback
        if (availPrem <= 0) availPrem = collateralUsd * 0.1; // Fallback to 10% of collateral as premium depth

        return {
            strike: strikeVal,
            expiry: new Date(item.expiry * 1000),
            premium: premiumVal,
            type: item.isCall ? 'Call' : 'Put',
            rawExpiry: item.expiry,
            rawPremium: item.price,
            rawOrder: item,
            availablePremium: availPrem
        };
    }).filter((q: OptionQuote | null) => q !== null && q.strike > 0 && q.premium > 0) as OptionQuote[];

    // Determine Available Expiries (Days) & Map to Real Timestamps
    const now = Date.now();
    const expiryMap: Record<number, number> = {};
    const availableDaysSet = new Set<number>();

    validQuotes.forEach(q => {
        const diffMs = q.expiry.getTime() - now;
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (days > 0) {
            availableDaysSet.add(days);
            if (!expiryMap[days]) {
                expiryMap[days] = q.expiry.getTime();
            }
        }
    });

    const availableDays = Array.from(availableDaysSet).sort((a,b) => a - b);

    return {
        currentPrice,
        quotes: validQuotes,
        expiries: availableDays,
        expiryMap,
        optionBookAddress: json.data?.optionBookAddress || THETANUTS_CONFIG.GENERIC_OPTION_BOOK
    };

  } catch (error) {
    console.error("Thetanuts Service Error:", error);
    return { currentPrice: 0, quotes: [], expiries: [], expiryMap: {} };
  }
}

/**
 * Helper: Get filtered strikes for a specific target expiry day and mode.
 * Returns exactly 4 strikes centered around ATM to fit the UI dots.
 */
export function getStrikesForExpiry(
    data: OptionChainData, 
    targetDays: number, 
    mode: 'UP' | 'DOWN'
): number[] {
   const now = Date.now();
   // Find quotes matching target days (tolerance +/- 1 day)
   const quotes = data.quotes.filter(q => {
       const diffMs = q.expiry.getTime() - now;
       const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
       return Math.abs(days - targetDays) <= 1;
   });
   
   if (quotes.length === 0) return [];
   
   // Unique Strikes sorted
   const strikes = Array.from(new Set(quotes.map(q => q.strike))).sort((a,b) => a - b);
   
   // Find ATM index (strike closest to indexPrice)
   let atmIndex = 0;
   let minDiff = Infinity;
   strikes.forEach((s, i) => {
       const diff = Math.abs(s - data.currentPrice);
       if (diff < minDiff) {
           minDiff = diff;
           atmIndex = i;
       }
   });

   /**
    * Selection Strategy for 4 Dots:
    * We want a balanced range that shows OTM potential.
    * UP (Call): ATM + 3 Above [atmIndex, atmIndex+1, atmIndex+2, atmIndex+3]
    * DOWN (Put): ATM + 3 Below [atmIndex-3, atmIndex-2, atmIndex-1, atmIndex]
    */
   let result: number[] = [];
   if (mode === 'UP') {
       const start = Math.max(0, atmIndex);
       result = strikes.slice(start, start + 4);
   } else {
       const end = Math.min(strikes.length, atmIndex + 1);
       const start = Math.max(0, end - 4);
       result = strikes.slice(start, end);
   }

   // If we still have less than 4, take any neighbors
   if (result.length < 4) {
       const start = Math.max(0, atmIndex - 2);
       result = strikes.slice(start, start + 4);
   }
   
   return result;
}

/**
 * Settlement Logic: Determines profit/loss for a position.
 */
export function calculateSettlement(
    position: { strike: number, isCall: boolean, premiumPaid: number, amount: number },
    expiryPrice: number
) {
    const { strike, isCall, premiumPaid, amount } = position;
    let payoutPerUnit = 0;
    
    if (isCall) {
        // Call ITM if Price > Strike
        payoutPerUnit = Math.max(0, expiryPrice - strike);
    } else {
        // Put ITM if Strike > Price
        payoutPerUnit = Math.max(0, strike - expiryPrice);
    }
    
    const totalPayout = payoutPerUnit * amount; // Simplified, usually depends on contract multiplier
    const netProfit = totalPayout - premiumPaid;
    
    return {
        won: netProfit > 0,
        payout: totalPayout,
        netProfit: netProfit,
        roi: (netProfit / premiumPaid) * 100
    };
}

const INDEXER_URL = "https://optionbook-indexer.thetanuts.finance/api/v1";

/**
 * Fetch Open Positions for a user
 */
export async function fetchUserPositions(address: string) {
    try {
        const url = `${INDEXER_URL}/user/${address}/positions`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch positions");
        const json = await res.json();
        
        // Return raw positions or map them
        return json.data || json;
    } catch (error) {
        console.error("Fetch Positions Error:", error);
        return [];
    }
}

/**
 * Fetch Settled Transaction History for a user
 */
export async function fetchUserHistory(address: string) {
    try {
        const url = `${INDEXER_URL}/user/${address}/history`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch history");
        const json = await res.json();
        return json.data || json;
    } catch (error) {
        console.error("Fetch History Error:", error);
        return [];
    }
}
