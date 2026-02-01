const fetch = require('node-fetch');

// Addresses from config/thetanuts.ts
const ASSETS = {
    WETH: '0x4200000000000000000000000000000000000006',
    CBETH: '0xbe9895146f7af43049ca1c1ae358b0541ea49704' // cbBTC
};

const ENDPOINT_URL = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain";

async function fetchAsset(symbol, address) {
    console.log(`\n=== FETCHING ${symbol} (${address}) ===`);
    const url = `${ENDPOINT_URL}?chainId=8453&assetAddress=${address}`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        const data = json.data || json;
        
        console.log(`Index Price (Thetanuts): $${data.indexPrice}`);
        const orders = data.orders || [];
        console.log(`Total Orders: ${orders.length}`);

        if (orders.length > 0) {
            // Check Tickers
            const tickers = new Set();
            orders.slice(0, 50).forEach(o => {
                const item = o.order || o;
                if (item.ticker) tickers.add(item.ticker.split('-')[0]);
            });
            console.log("Tickers Match found:", Array.from(tickers));

            // Dump sample item
            const sample = orders[0].order || orders[0];
            console.log("Sample Item Keys:", Object.keys(sample));
            console.log("Sample Ticker:", sample.ticker);
            console.log("Sample Expiry:", new Date(sample.expiry * 1000).toISOString());
            console.log("Sample Strike raw:", sample.strikes ? sample.strikes[0] : sample.strike);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function main() {
    await fetchAsset('BTC (cbBTC)', ASSETS.CBETH);
    await fetchAsset('ETH', ASSETS.WETH);
}

main();
