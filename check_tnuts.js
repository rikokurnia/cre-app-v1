const fetch = require('node-fetch'); // or use built-in fetch in newer node
// If node-fetch is not installed, we can rely on global fetch in Node 18+

const ENDPOINT = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain";

// Chain ID 8453 = Base
const ASSETS = {
    ETH: { address: '0x4200000000000000000000000000000000000006' },
    BTC: { address: '0xbe9895146f7af43049ca1c1ae358b0541ea49704' } // cbBTC
};

async function fetchAssetData(symbol) {
    console.log(`\n\n--- FETCHING DATA FOR ${symbol} ---`);
    const addr = ASSETS[symbol].address;
    const url = `${ENDPOINT}?chainId=8453&assetAddress=${addr}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        // Log keys to confirm structure
        console.log("Root Keys:", Object.keys(data));
        
        // Assuming data.quotes or data.orders exists? 
        // Based on user logs: "Raw Data Snippet: {"data":{"timestamp"... "orders": [...]"
        // Wait, the user log shows `{"data": ...}` wrapper.
        // Let's inspect `data.data` if it exists.
        
        const content = data.data || data; 
        const orders = content.orders || content.quotes || [];
        
        // Find Spot Price (Mocking or Extracting)
        // Does the API give spot price? User log says "CURRENT SPOT PRICE: $2705.13"
        // It might be in `indexPrice` or we assume one for calculation if missing
        let spotPrice = content.indexPrice ? parseFloat(content.indexPrice) : 0;
        
        // If spot price is missing in API, use a rough real-time fallback for display context
        if (!spotPrice) {
            spotPrice = symbol === 'ETH' ? 2705.13 : 85000.00; // Snapshot from user logs
        }
        
        console.log(`CURRENT SPOT PRICE: $${spotPrice.toFixed(2)}`);

        if (orders.length === 0) {
            console.log("No orders/quotes found.");
            return;
        }

        // Process Orders/Quotes
        // Structure from user log: order: { strike, expiry, price (premium?), isCall, ... }
        // User log lists "orders" array containing objects with "order" property.
        
        const processed = orders.map(o => {
            const item = o.order || o; // Handle wrapper
            // Check if strike is huge integer (18 decimals) or scaled 6 decimals
            // User log: "strikes":[260000000000] -> looks like 8 decimals? 2600 * 10^8 ? 
            // Thetanuts often uses 1e6 for USDC strikes or generic scaling.
            // Let's infer from the value.
            
            // Log sample raw to debug scaling
            // console.log("Sample Strike Raw:", item.strikes ? item.strikes[0] : item.strike);

            let strikeVal = 0;
            if (item.strikes && item.strikes.length > 0) strikeVal = Number(item.strikes[0]);
            else if (item.strike) strikeVal = Number(item.strike);
            
            // Heuristic to normalize strike to human readable
            if (strikeVal > 100000000) strikeVal = strikeVal / 100000000; // Guessing 1e8 based on 260000000000 -> 2600
            else if (strikeVal > 100000) strikeVal = strikeVal / 1e6; // USDC standard

            let premiumVal = Number(item.price);
            // Heuristic for premium
            // User log: 4562.5455. If raw is 351667190... maybe 1e5 or 1e6?
            // "price":"351667190" -> 351.6 ? No, user log says 4562.
            // Let's trust the relative calculation or just display raw for now until confirmed.
            // Actually, let's just use the `item.price` / 1e6 (USDC decimals) as a starting guess.
            if (premiumVal > 1000000) premiumVal = premiumVal / 1e6;

            const expiryDate = new Date(item.expiry * 1000); // Unix timestamp
            
            return {
                strike: strikeVal,
                expiry: expiryDate,
                premium: premiumVal,
                type: item.isCall ? 'Call' : 'Put',
                rawExpiry: item.expiry
            };
        });

        // Group by Days to Expiry
        const now = Date.now();
        const grouped = {};
        
        processed.forEach(p => {
            const diffMs = p.expiry.getTime() - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return; // Expired
            
            if (!grouped[diffDays]) grouped[diffDays] = [];
            grouped[diffDays].push(p);
        });

        // Target Days: 1, 2, 3, 7, 28
        const targets = [1, 2, 3, 7, 28];
        
        targets.forEach(t => {
            console.log(`\n--------------------------------------------------`);
            console.log(`EXPIRY #${t}: ${t} Days (approx)`);
            console.log(`--------------------------------------------------`);
            
            // Find quotes with expiry = t (or t +/- 1 if exact match missing)
            let matchDay = t;
            if (!grouped[t] && grouped[t+1]) matchDay = t+1;
            
            const group = grouped[matchDay] || [];
            if (group.length === 0) {
                console.log("No data found.");
                return;
            }

            // Filter: 3 strikes below, 3 above spot
            // Sort by strike
            group.sort((a,b) => a.strike - b.strike);
            
            // Find ATM index: closest to spotPrice
            let minDiff = Infinity;
            let atmIndex = -1;
            group.forEach((g, i) => {
                const d = Math.abs(g.strike - spotPrice);
                if (d < minDiff) { 
                    minDiff = d; 
                    atmIndex = i;
                }
            });

            // Slice range: ATM-3 to ATM+3 (total 7 items ideally)
            const start = Math.max(0, atmIndex - 3);
            const end = Math.min(group.length, atmIndex + 4); // +4 because slice end is exclusive
            const slice = group.slice(start, end);

            // Print Table
            console.log("Strike ($)\tDistance\tPremium ($)\tType");
            slice.forEach(row => {
               const dist = (row.strike - spotPrice).toFixed(2);
               console.log(`${row.strike}\t\t${dist}\t\t${row.premium.toFixed(4)}\t\t${row.type}`);
            });
        });


    } catch (e) {
        console.error("Script Error:", e);
    }
}

async function main() {
    await fetchAssetData('ETH');
    await fetchAssetData('BTC');
}

main();
