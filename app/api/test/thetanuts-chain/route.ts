import { NextRequest, NextResponse } from "next/server";
import { THETANUTS_CONFIG } from "@/config/thetanuts";

export async function GET(req: NextRequest) {
  const assets = ["ETH", "BTC"];
  const debugLog: any[] = [];
  const results: any = {};
  let data: any = {}; // Initialize outer scope

  debugLog.push("Starting Chain Test...");

  for (const asset of assets) {
    try {
        // Construct the expected API/Route for Basic Option Book
        // Documentation implies: GET /basic-option-book/option-chain?chainId=8453&assetAddress=...
        // But using the configured worker URL:
        // https://round-snowflake-9c31.devops-118.workers.dev/chain/8453/asset/WETH/option-chain (Hypothetical)
        // Let's try the /v1/basic-option-book endpoint structure commonly used in these indexers.
        
        // Strategy: We will fetch the actual `fetchOptionBook` logic if we had the service file.
        // Since I couldn't find `app/services/thetanuts.ts` (it was missing), I'll write the fetch logic here directly
        // to mimic what the service SHOULD do, and test if it works.
        
        const assetObj = asset === 'ETH' ? THETANUTS_CONFIG.ASSETS.WETH : THETANUTS_CONFIG.ASSETS.CBETH;
        const assetAddr = assetObj.address;
        
        // Probe multiple endpoints to find the correct one
        const candidates = [
            `${THETANUTS_CONFIG.API_URL_PRICING}/basic-option-book/option-chain?chainId=8453&assetAddress=${assetAddr}`,
            `${THETANUTS_CONFIG.API_URL_PRICING}/v1/basic-option-book/option-chain?chainId=8453&assetAddress=${assetAddr}`,
            `${THETANUTS_CONFIG.API_URL_PRICING}/option-chain?chainId=8453&assetAddress=${assetAddr}`,
            // Try fetching "all" if specific asset fails?
            // `${THETANUTS_CONFIG.API_URL_PRICING}/basic-option-book/option-chain` 
        ];

        let quotes: any[] = [];
        let successUrl = "";

        for (const url of candidates) {
            try {
                debugLog.push(`Probing: ${url}`);
                const response = await fetch(url, { next: { revalidate: 0 } });
                if (response.ok) {
                    const json = await response.json();
                    debugLog.push(`Response from ${url}: Status ${response.status}, Keys: ${Object.keys(json).join(',')}`);
                    
                    if (json.quotes && json.quotes.length > 0) {
                        quotes = json.quotes;
                        successUrl = url;
                        data = json; // Capture main data object
                        break; // Found it!
                    } else if (Array.isArray(json) && json.length > 0) {
                         // Maybe it returns array directly?
                         quotes = json;
                         successUrl = url;
                         break;
                    }
                }
            } catch (e: any) {
                debugLog.push(`Failed probe ${url}: ${e.message}`);
            }
        }

        if (quotes.length === 0) {
             // Mock Data Fallback if Real API Fails (User requested to "test api", but if it fails we need to know)
             debugLog.push(`No quotes found on any endpoint for ${asset}.`);
             results[asset] = { status: "No Data Found", probes: debugLog.filter(l => l.includes(asset)) };
             continue;
        }

        // ANALYSIS (Existing Logic)

        // ANALYSIS
        // 1. Group by Expiry
        const byExpiry: any = {};
        quotes.forEach((q: any) => {
            // q.expiryTimestamp is unix seconds
            const days = Math.round((q.expiryTimestamp - (Date.now()/1000)) / 86400);
            if (!byExpiry[days]) byExpiry[days] = [];
            byExpiry[days].push(q);
        });

        // 2. Check Coverage
        const coverage: any = {};
        const targetDays = [1, 2, 3, 7, 28];
        
        for (const t of targetDays) {
            // Find closest bucket
            const availableDays = Object.keys(byExpiry).map(Number);
            const closest = availableDays.sort((a,b) => Math.abs(a-t) - Math.abs(b-t))[0];
            const diff = Math.abs(closest - t);
            
            const matches = byExpiry[closest] || [];
            // Sort by strike
            matches.sort((a: any, b: any) => a.strike - b.strike);
            
            const currentPrice = data.indexPrice || 0;
            const otmCount = matches.filter((m: any) => m.strike > currentPrice).length; // Call OTM
            const itmCount = matches.filter((m: any) => m.strike < currentPrice).length;
            
            coverage[`Target_${t}d`] = {
                foundDay: closest,
                diff: diff,
                count: matches.length,
                range: matches.length > 0 ? `${matches[0].strike} - ${matches[matches.length-1].strike}` : 'N/A',
                strikesBelow: itmCount,
                strikesAbove: otmCount,
                status: (diff <= 1 && otmCount >= 3 && itmCount >= 3) ? 'OK' : 'WARNING'
            };
        }

        results[asset] = {
            currentPrice: data.indexPrice,
            totalQuotes: quotes.length,
            coverage: coverage,
            // rawSample: quotes.slice(0, 3) 
        };

    } catch (error: any) {
        debugLog.push(`Error for ${asset}: ${error.message}`);
        results[asset] = { error: error.message };
    }
  }

  return NextResponse.json({ 
    debug: debugLog,
    results: results
  });
}
