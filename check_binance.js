
async function checkBinance() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT");
        if (!res.ok) throw new Error("Status " + res.status);
        const data = await res.json();
        console.log("Binance ETH Price:", data.lastPrice);
    } catch (e) {
        console.error("Binance Error:", e.message);
    }
}

checkBinance();
