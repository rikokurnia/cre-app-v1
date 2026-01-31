require('dotenv').config({ path: '.env' });
const { createWalletClient, createPublicClient, http, parseUnits, encodeFunctionData, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { base } = require('viem/chains');

// Robust RPC
const RPC_URL = "https://mainnet.base.org"; 

// --- CONFIG ---
const THETANUTS_API = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0x4200000000000000000000000000000000000006"; // WETH
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const GENERIC_BOOK = "0xd58b814C7Ce700f251722b5555e25aE0fa8169A1"; 
const REFERRER = "0xd1C46EbdCE5d3b84869cC0754735036efeA41cA4";

// ABI USDC (Approve)
const ERC20_ABI = [
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ABI FillOrder
const OPTION_BOOK_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "name": "maker", "type": "address" },
          { "name": "orderExpiryTimestamp", "type": "uint256" },
          { "name": "collateral", "type": "address" },
          { "name": "isCall", "type": "bool" },
          { "name": "priceFeed", "type": "address" },
          { "name": "implementation", "type": "address" },
          { "name": "isLong", "type": "bool" },
          { "name": "maxCollateralUsable", "type": "uint256" },
          { "name": "strikes", "type": "uint256[]" },
          { "name": "expiry", "type": "uint256" },
          { "name": "price", "type": "uint256" },
          { "name": "extraOptionData", "type": "bytes" }
        ],
        "name": "order",
        "type": "tuple"
      },
      { "name": "amount", "type": "uint256" },
      { "name": "referrer", "type": "address" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function main() {
    console.log("\n🚀 EXECUTING LIVE TRADE ON BASE MAINNET (REAL FUNDS)...\n");

    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const client = createPublicClient({ chain: base, transport: http(RPC_URL) });
    const wallet = createWalletClient({ account, chain: base, transport: http(RPC_URL) });
    
    console.log(`👤 Executor: ${account.address}`);

    // 1. CHECK USDC BALANCE
    const balance = await client.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
    });
    console.log(`💰 USDC Balance: ${Number(balance) / 1e6} USDC`);
    
    if (balance < 1000n) { // Check if < 0.001 USDC
        console.error("❌ Insufficient USDC (Need at least $0.01 for test)");
        return;
    }

    // 2. GET REAL QUOTE
    console.log("📡 Fetching Market Data...");
    const res = await fetch(THETANUTS_API);
    const apiData = await res.json();
    const orders = apiData.data?.orders || [];
    
    // Cari Call Option WETH
    const target = orders.find(o => o.order.ticker.includes("ETH") && o.order.isCall);
    if (!target) throw new Error("No WETH Call Orders found.");

    const raw = target.order;
    const price = Number(raw.price) / 1e6; // Premium per contract (normalized display)
    console.log(`✅ Quote Found: Strike $${raw.strikes[0]/1e8} | Premium: $${price}`);

    // 3. PREPARE PARAMS
    // Buy 0.001 Contracts (Normal Size ~ $1.7)
    const contractsToBuyStr = "0.001";
    const contractsToBuyBI = parseUnits(contractsToBuyStr, 18); 
    
    // Calculate APPROVAL Amount (Price * Contracts)
    // Raw Price is per 1e18 contracts
    const rawPriceBI = BigInt(raw.price); 
    const costBI = (rawPriceBI * contractsToBuyBI) / BigInt(1e18);
    const costUSDC = formatUnits(costBI, 6);
    
    console.log(`🔹 Action: BUY ${contractsToBuyStr} Contracts`);
    console.log(`🔹 Cost: ~${costUSDC} USDC`);
    console.log(`🔹 Cost (Wei): ${costBI}`);


    const orderTuple = {
        maker: raw.maker,
        orderExpiryTimestamp: BigInt(raw.orderExpiryTimestamp),
        collateral: raw.collateral,
        isCall: raw.isCall !== undefined ? raw.isCall : true,
        priceFeed: raw.priceFeed,
        implementation: raw.implementation,
        isLong: raw.isLong !== undefined ? raw.isLong : false,
        maxCollateralUsable: BigInt(raw.maxCollateralUsable),
        strikes: raw.strikes.map(s => BigInt(s)),
        expiry: BigInt(raw.expiry),
        price: BigInt(raw.price),
        extraOptionData: raw.extraOptionData || '0x'
    };

    // 4. APPROVE USDC to IMPLEMENTATION (NOT Generic Book)
    // Approve 10x cost just to be safe
    const approveAmount = costBI * 10n > parseUnits("0.01", 6) ? costBI * 10n : parseUnits("0.01", 6);
    
    console.log(`\n1️⃣  Sending APPROVE Transaction to: ${raw.implementation}...`);
    try {
        const approveHash = await wallet.writeContract({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            account,
            args: [raw.implementation, approveAmount] // CORRECT SPENDER?
        });
        console.log(`✅ Approval Sent! Hash: https://basescan.org/tx/${approveHash}`);
        
        console.log("⏳ Waiting for Confirmation...");
        await client.waitForTransactionReceipt({ hash: approveHash });
        console.log("✅ Approved Confirmed on-chain.");

    } catch (err) {
        console.error("❌ Approval Failed:", err.shortMessage || err.message);
        return;
    }

    // 5. RE-FETCH FRESH QUOTE (CRITICAL)
    console.log("\n🔄 RE-FETCHING FRESH QUOTE BEFORE EXECUTION...");
    const res2 = await fetch(THETANUTS_API);
    const apiData2 = await res2.json();
    const orders2 = apiData2.data?.orders || [];
    const target2 = orders2.find(o => o.order.ticker.includes("ETH") && o.order.isCall);
    if (!target2) throw new Error("No WETH Call Orders found for execution.");
    
    const raw2 = target2.order;
    console.log(`✅ Fresh Quote: Strike $${raw2.strikes[0]/1e8} | Premium: $${Number(raw2.price)/1e6}`);

    const orderTuple2 = {
        maker: raw2.maker,
        orderExpiryTimestamp: BigInt(raw2.orderExpiryTimestamp),
        collateral: raw2.collateral,
        isCall: raw2.isCall !== undefined ? raw2.isCall : true,
        priceFeed: raw2.priceFeed,
        implementation: raw2.implementation,
        isLong: raw2.isLong !== undefined ? raw2.isLong : false,
        maxCollateralUsable: BigInt(raw2.maxCollateralUsable),
        strikes: raw2.strikes.map(s => BigInt(s)),
        expiry: BigInt(raw2.expiry),
        price: BigInt(raw2.price),
        extraOptionData: raw2.extraOptionData || '0x'
    };

    console.log("\n2️⃣  Sending FILL ORDER (TRADE) Transaction...");
    try {
        // HYPOTHESIS 4: Approve Implementation + Execute Implementation
        console.log(`🎯 Targeting Implementation DIRECTLY: ${raw2.implementation}`);
        
        const tradeHash = await wallet.writeContract({
            address: raw2.implementation, // DIRECT HIT
            abi: OPTION_BOOK_ABI,
            functionName: 'fillOrder',
            account,
            args: [orderTuple2, contractsToBuyBI, REFERRER], 
            gas: 500000n 
        });
        
        console.log(`\n🎉 TRADE SENT! Hash: https://basescan.org/tx/${tradeHash}`);
        console.log("⏳ Waiting for Confirmation...");
        
        const receipt = await client.waitForTransactionReceipt({ hash: tradeHash });
        if (receipt.status === 'success') {
             console.log("✅✅✅ TRADE SUCCESSFUL! YOU HAVE OFFICIALLY INTEGRATED THETANUTS! 🥜");
        } else {
             console.error("❌ Transaction Reverted on-chain.");
        }

    } catch (err) {
        console.log("\n⚠️ TRADE FAILED:");
        console.error(err.shortMessage || err.message);
    }
}

main();
