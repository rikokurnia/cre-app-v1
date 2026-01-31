require('dotenv').config({ path: '.env' });
const { createWalletClient, http, encodeFunctionData, parseUnits, createPublicClient } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { base } = require('viem/chains');

// Minimal ABI for fillOrder
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
  },
  {
    "inputs": [
        { "name": "spender", "type": "address" },
        { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
];

// Config
const THETANUTS_API = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=0x4200000000000000000000000000000000000006"; // ETH Quote
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function main() {
    console.log("🚀 Starting Thetanuts Transaction Test...");
    
    // 1. Setup Wallet
    if (!process.env.PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY in .env");
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    console.log(`Wallet Address: ${account.address}`);

    const client = createWalletClient({
        account,
        chain: base,
        transport: http("https://mainnet.base.org")
    });

    const publicClient = createPublicClient({
        chain: base,
        transport: http("https://mainnet.base.org")
    });

    // 2. Fetch Quote
    console.log("Fetching Option Quote...");
    const res = await fetch(THETANUTS_API);
    const json = await res.json();
    const data = json.data || json;
    
    // Find a valid quote (preferably cheapest for test)
    const quote = data.orders && data.orders.length > 0 ? data.orders[0].order || data.orders[0] : null;
    if (!quote) throw new Error("No Quotes Found in API");
    
    console.log(`Found Quote: Strike $${quote.strikes[0]/1e6 || quote.price} | Expiry: ${quote.expiry}`);
    
    // Manual Override for Base Mainnet OptionBook
    data.optionBookAddress = '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1';
    console.log(`OptionBook Address: ${data.optionBookAddress}`);
    
    if (!data.optionBookAddress) throw new Error("Missing OptionBook Address in API");

    // 3. Prepare Transaction
    const amount = 0.0001;
    const amountBI = parseUnits(amount.toString(), 6); // USDC 6 decimals
    console.log(`Amount to Buy: ${amount} USDC (${amountBI} units)`);

    // 3.1 Check USDC Balance & Approval (Optional for pure test script, but good practice)
    const balance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
    });
    console.log(`USDC Balance: ${balance.toString()}`);
    
    if (balance < amountBI) {
        console.warn("⚠️ Insufficient USDC Balance! Transaction will likely revert.");
    }

    // 3.2 Approve OptionBook to spend USDC
    console.log("Approving OptionBook...");
    const approveHash = await client.writeContract({
        address: USDC_ADDRESS,
        abi: OPTION_BOOK_ABI, // Approve is in minimal ABI above
        functionName: 'approve',
        args: [data.optionBookAddress, amountBI * 100n] // Approve plenty
    });
    console.log(`Approval Tx: https://basescan.org/tx/${approveHash}`);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("Approved!");

    // 4. Fill Order
    const orderTuple = {
        maker: quote.maker,
        orderExpiryTimestamp: BigInt(quote.orderExpiryTimestamp || 0),
        collateral: quote.collateral,
        isCall: quote.isCall,
        priceFeed: quote.priceFeed,
        implementation: quote.implementation,
        isLong: quote.isLong,
        maxCollateralUsable: BigInt(quote.maxCollateralUsable || 0),
        strikes: quote.strikes.map(s => BigInt(s)),
        expiry: BigInt(quote.expiry),
        price: BigInt(quote.price),
        extraOptionData: quote.extraOptionData || '0x'
    };
    
    console.log("Submitting fillOrder...");
    const hash = await client.writeContract({
        address: data.optionBookAddress,
        abi: OPTION_BOOK_ABI,
        functionName: 'fillOrder',
        args: [
            orderTuple,
            amountBI,
            '0x0000000000000000000000000000000000000000' // No referrer
        ]
    });
    
    console.log(`✅ Transaction Sent!`);
    console.log(`Hash: ${hash}`);
    console.log(`Explorer: https://basescan.org/tx/${hash}`);
}

main().catch(console.error);
