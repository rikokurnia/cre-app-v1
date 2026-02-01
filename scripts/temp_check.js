const fetch = require('node-fetch');

async function testThetanuts() {
    console.log("Fetching Thetanuts Data for BTC...");
    // Using the direct worker URL for testing node script
    const url = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // CBETH/BTC address
    // Wait, let's use the one from config for BTC (CBETH variant usually for testnet/base?)
    // In `thetanuts-v4.ts`: ASSETS.CBETH
    
    // Let's look at thetanuts config first to be sure of address
    // But for now I'll try the one I know or check the file content if needed.
    // Actually, I'll guess the ID or look at previous successful logs if any.
    // The previous log didn't show the URL.
    
    // Let's use the URL from thetanuts-v4.ts logic.
    // We can't import typescript config in node js script easily without compilation.
    // So I will read the file `app/services/thetanuts-v4.ts` again to check the address or logic? 
    // No, I'll just use the URL I saw in the file previously.
    
    const BTC_ADDRESS = "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9"; // Example guessing or I should checking config.
    // To be safe, let's look at `config/thetanuts.ts`.
}

// I'll read config first.
