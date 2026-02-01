// Native fetch
async function checkApi() {
  // BTC URL and ETH URL
  const btcUrl = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0xbe9895146f7af43049ca1c1ae358b0541ea49704"; // cbBTC
  const ethUrl = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0x4200000000000000000000000000000000000006"; // WETH

  try {
    console.log("--- ETH ANALYSIS ---");
    const ethRes = await fetch(ethUrl);
    const ethData = await ethRes.json();
    const ethOrders = ethData.data?.orders || ethData.data?.quotes || [];
    if (ethOrders.length > 0) {
        ethOrders.slice(0, 3).forEach(o => {
            const item = o.order || o;
            console.log(`Ticker: ${item.ticker}, StrikeRaw: ${item.strikes?.[0] || item.strike}, Price: ${item.price}`);
        });
    }

    console.log("\n--- BTC ANALYSIS ---");
    const btcRes = await fetch(btcUrl);
    const btcData = await btcRes.json();
    const btcOrders = btcData.data?.orders || btcData.data?.quotes || [];
    if (btcOrders.length > 0) {
        btcOrders.slice(0, 3).forEach(o => {
            const item = o.order || o;
            console.log(`Ticker: ${item.ticker}, StrikeRaw: ${item.strikes?.[0] || item.strike}, Price: ${item.price}`);
        });
    }

  } catch (e) {
    console.error("Error:", e);
  }
}

checkApi();
