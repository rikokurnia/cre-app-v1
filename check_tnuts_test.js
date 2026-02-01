// Native fetch check
async function checkApi() {
  const url = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0xbe9895146f7af43049ca1c1ae358b0541ea49704";
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Status " + res.status);
    const json = await res.json();
    
    const content = json.data || json;
    console.log("Index Price:", content.indexPrice);
    
    const orders = content.orders || content.quotes || [];
    console.log("Total Orders:", orders.length);
    
    if (orders.length > 0) {
      // Analyze first few orders
      console.log("Sample Orders:");
      orders.slice(0, 5).forEach((o, i) => {
         const item = o.order || o;
         console.log(`[${i}] Strike: ${item.strike || item.strikes[0]}, Expiry: ${new Date(item.expiry * 1000).toISOString()}, Type: ${item.isCall ? 'Call' : 'Put'}, Price: ${item.price}`);
      });
      
      // Extract unique strikes
      const strikes = new Set();
      orders.forEach(o => {
          const item = o.order || o;
          strikes.add(item.strike || item.strikes[0]);
      });
      console.log("Unique Strikes:", Array.from(strikes).sort((a,b)=>a-b));
    }
    
  } catch (e) {
    console.error("Error:", e);
  }
}

checkApi();
