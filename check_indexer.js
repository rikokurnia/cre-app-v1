
const fetch = require('node-fetch'); // or global fetch

async function checkIndexer() {
    const url = "https://optionbook-indexer.thetanuts.finance/api/v1/orders";
    console.log("Fetching from:", url);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log("Indexer API failed:", res.status, res.statusText);
            return;
        }
        const data = await res.json();
        // data.orders? or data?
        const orders = data.orders || data;
        
        if (orders.length > 0) {
            console.log("Found orders:", orders.length);
            const slice = orders.slice(0, 1);
            console.log("First Order Keys:", Object.keys(slice[0]));
            if (slice[0].order) {
                 console.log("Inner Order Keys:", Object.keys(slice[0].order));
                 console.log("Inner Order numContracts:", slice[0].order.numContracts);
            }
        } else {
            console.log("No orders found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkIndexer();
