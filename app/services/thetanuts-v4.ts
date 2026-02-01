
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

const ENDPOINT_URL = typeof window !== 'undefined' ? "/api/thetanuts/chain" : "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain";

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
        // Ticker format: SYMBOL-DATE-STRIKE-TYPE (e.g. "ETH-2FEB26-2200-P")
        if (!item.ticker) return null;
        
        // Filter by asset symbol to prevent mixing ETH/BTC
        // Note: Thetanuts sometimes uses "cbBTC" or "WBTC" or just "BTC" prefix. 
        // We match strictly if possible, or fuzzy match if necessary.
        // For now, let's rely on the parsing of the tick to confirm asset.
        const ticker = item.ticker;
        if (!ticker.startsWith(assetSymbol) && !ticker.startsWith('cb' + assetSymbol) && !ticker.startsWith('W' + assetSymbol)) {
             // Allow 'BTC' to match 'cbBTC' tickers if standard
             if (assetSymbol === 'BTC' && !ticker.includes('BTC')) return null;
             if (assetSymbol === 'ETH' && !ticker.includes('ETH')) return null;
        }

        let strikeVal = 0;
        
        // 1. Try Parsing from Ticker (Most Reliable)
        try {
            const parts = ticker.split('-');
            if (parts.length >= 3) {
                const parsedStrike = parseFloat(parts[2]);
                if (!isNaN(parsedStrike) && parsedStrike > 0) {
                    strikeVal = parsedStrike;
                }
            }
        } catch (e) { /* ignore */ }

        // 2. Fallback to Raw Strike with Condition Scaling
        if (strikeVal === 0) {
             let rawStrike = 0;
             if (item.strikes && item.strikes.length > 0) rawStrike = Number(item.strikes[0]);
             else if (item.strike) rawStrike = Number(item.strike);
             
             // ETH Raw = 1e8 scale (e.g. 2200 * 1e8)
             // BTC Raw = 1e6 scale (e.g. 75000 * 1e6)? Or 1e8? 
             // Based on analysis: ETH is 1e8. BTC (cbBTC) is 1e6.
             if (assetSymbol === 'ETH') {
                 strikeVal = rawStrike / 1e8;
             } else {
                 // BTC / cbBTC
                 strikeVal = rawStrike / 1e6;
             }
        }

        let premiumVal = Number(item.price);
        // Premium Scaling Logic fix: 
        // If val > 1e8, assume 1e8 scaling (likely native oracle precision).
        // If val > 1e6, assume 1e6 scaling (USDC).
        if (premiumVal > 100000000) premiumVal = premiumVal / 1e8;
        else if (premiumVal > 1000000) premiumVal = premiumVal / 1e6;

        // Calculate Liquidity (Max Premium Taker can pay)
        const collateralRaw = Number(item.maxCollateralUsable || item.collateral || 0);
        let contractsAvailable = 0;

        if (item.isCall) {
            // Call Options (ETH/BTC): Collateral is the Asset (WETH, cbBTC) -> 18 decimals usually.
            // 1 Unit of Collateral = 1 Contract.
            // Exception: WBTC is 8 decimals, but on Base most are 18.
            let decimals = 18;
            if (assetSymbol === 'BTC' && item.ticker && item.ticker.includes('WBTC')) decimals = 8;
            
            contractsAvailable = collateralRaw / Math.pow(10, decimals);
        } else {
            // Put Options: Collateral is USDC (6 decimals).
            // Contracts = CollateralUSDC / StrikePrice.
            const collateralUsdc = collateralRaw / 1e6;
            const effectiveStrike = strikeVal || currentPrice || 1;
            contractsAvailable = collateralUsdc / effectiveStrike;
        }

        let availPrem = contractsAvailable * premiumVal;
        
        // Filter dust
        if (availPrem < 0.0001) availPrem = 0;

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
    // Return a safe fallback structure so UI doesn't crash
    return { 
        currentPrice: assetSymbol === 'ETH' ? 2450.00 : 79000.00, 
        quotes: [], 
        expiries: [], 
        expiryMap: {} 
    };
  }
}

/**
 * Helper: Get filtered strikes for a specific target expiry day and mode.
 * Returns exactly 4 strikes centered around ATM to fit the UI dots.
 */
export function getStrikesForExpiry(
    data: OptionChainData, 
    targetDays: number, 
    mode: 'UP' | 'DOWN',
    overridePrice?: number
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
   
   const referencePrice = overridePrice || data.currentPrice;

   /**
    * STRICT DIRECTIONAL LOGIC (3 Nearest + 1)
    * Goal: Show 4 strikes starting from ATM (Safer) -> OTM (Riskier).
    * 
    * UP (Call): Strikes >= Price. Sort Ascending (Low->High).
    * [Price=2400] -> [2400, 2450, 2500, 2550]
    * Left (Safer) = 2400. Right (Riskier) = 2550.
    * 
    * DOWN (Put): Strikes <= Price. Sort Descending (High->Low).
    * [Price=2400] -> [2400, 2350, 2300, 2250]
    * Left (Safer) = 2400. Right (Riskier) = 2250.
    */
   let result: number[] = [];

   if (mode === 'UP') {
       // Filter: Strikes >= Price (or very close to it)
       const validStrikes = strikes.filter(s => s >= referencePrice * 0.999); 
       // Sort Ascending (Nearest to price first)
       validStrikes.sort((a, b) => a - b);
       // Take top 4
       result = validStrikes.slice(0, 4);
   } else {
       // DOWN (Put): Strikes <= Price.
       // User wants: "Makin kiri makin turun harganya" -> Left = Lower Strike.
       // So valid set is strikes <= Price.
       // We want the 4 CLOSEST to the price.
       const validStrikes = strikes.filter(s => s <= referencePrice * 1.001);
       
       // Sort Descending first to find the 4 closest to price (highest values <= price)
       validStrikes.sort((a, b) => b - a);
       
       // Take the top 4 closest
       const closest4 = validStrikes.slice(0, 4);
       
       // Now sort them ASCENDING (Low -> High) for display
       // So Left (Index 0) = Lowest Price (Deep OTM)
       // Right (Index 3) = Highest Price (ATM)
       result = closest4.sort((a, b) => a - b);
   }

   // --- FALLBACKS ONLY IF EMPTY ---
   if (result.length === 0 && strikes.length > 0) {
       // Find closest index
       let closestIdx = 0;
       let minD = Infinity;
       strikes.forEach((s, i) => {
           const d = Math.abs(s - referencePrice);
           if (d < minD) { minD = d; closestIdx = i; }
       });
       
       // Just grab 4 around there
       const start = Math.max(0, closestIdx - 1);
       result = strikes.slice(start, start + 4);
       
       result.sort((a, b) => a - b); // Always Ascending Fallback
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
