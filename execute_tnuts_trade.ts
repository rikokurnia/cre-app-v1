
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const OPTION_BOOK_ADDRESS = '0xd58b814C7Ce700f251722b5555e25aE0fa8169A1';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const ETH_ASSET_ADDRESS = '0x4200000000000000000000000000000000000006';

// --- ABIS ---
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{name: "", type: "uint8"}]
  }
] as const;

const OPTION_BOOK_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "maker", "type": "address" },
          { "internalType": "uint256", "name": "orderExpiryTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "collateral", "type": "address" },
          { "internalType": "bool", "name": "isCall", "type": "bool" },
          { "internalType": "address", "name": "priceFeed", "type": "address" },
          { "internalType": "address", "name": "implementation", "type": "address" },
          { "internalType": "bool", "name": "isLong", "type": "bool" },
          { "internalType": "uint256", "name": "maxCollateralUsable", "type": "uint256" },
          { "internalType": "uint256[]", "name": "strikes", "type": "uint256[]" },
          { "internalType": "uint256", "name": "expiry", "type": "uint256" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bytes", "name": "extraOptionData", "type": "bytes" }
        ],
        "internalType": "struct IOptionBook.Order",
        "name": "order",
        "type": "tuple"
      },
      { "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "internalType": "uint256", "name": "numContracts", "type": "uint256" },
      { "internalType": "address", "name": "referrer", "type": "address" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// --- MAIN FUNCTION ---
async function main() {
    console.log("\n=== STARTING THETANUTS TRANSACTION TEST ===\n");

    // 1. Load Env
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.error("Error: .env file not found.");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
        const idx = line.indexOf('=');
        if (idx > 0) {
            const key = line.substring(0, idx).trim();
            const val = line.substring(idx + 1).trim();
            envVars[key] = val;
        }
    });

    let privateKey = envVars['PRIVATE_KEY'];
    if (!privateKey) {
        console.error("Error: PRIVATE_KEY not found in .env");
        process.exit(1);
    }
    if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey;

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const rpcUrl = envVars['RPC_URL'] || 'https://mainnet.base.org';

    console.log(`Wallet: ${account.address}`);
    console.log(`RPC: ${rpcUrl}`);

    const client = createWalletClient({
        account,
        chain: base,
        transport: http(rpcUrl)
    }).extend(publicActions);

    // 2. Fetch Option Chain
    console.log("\nFetching Option Chain for ETH...");
    const apiUrl = `https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain?chainId=8453&assetAddress=${ETH_ASSET_ADDRESS}`;
    
    let orders: any[] = [];
    try {
        const resp = await fetch(apiUrl);
        if (!resp.ok) throw new Error(`API Error: ${resp.statusText}`);
        const json = await resp.json();
        orders = (json.data && json.data.orders) ? json.data.orders : [];
    } catch (e) {
        console.error("Fetch Failed:", e);
        process.exit(1);
    }

    if (orders.length === 0) {
        console.error("No orders found.");
        process.exit(0);
    }

    // 3. Filter Candidate Order (ETH Call, ~2 Days)
    const now = Math.floor(Date.now() / 1000);
    // Target: Expiry between 36 hours (1.5 days) and 60 hours (2.5 days)
    const minExp = now + (36 * 3600);
    const maxExp = now + (60 * 3600);

    console.log(`Searching for CALL orders expiring between ${new Date(minExp*1000).toISOString()} and ${new Date(maxExp*1000).toISOString()}`);

    const filtered = orders.filter((o: any) => {
        const od = o.order;
        const exp = Number(od.expiry);
        return od.isCall && exp >= minExp && exp <= maxExp;
    });

    if (filtered.length === 0) {
        console.log("No exact match for ~2 days. Checking all calls...");
        // Fallback to any Call
        const anyCall = orders.filter((o: any) => o.order.isCall && Number(o.order.expiry) > now).sort((a,b) => Number(a.order.expiry) - Number(b.order.expiry));
        if (anyCall.length > 0) {
            console.log("Picking nearest/best available Call instead.");
            filtered.push(anyCall[0]);
        } else {
            console.error("No valid calls found.");
            process.exit(0);
        }
    }

    // Select the first one
    const selected = filtered[0];
    console.log("DEBUG: FULL SELECTED OBJECT:", JSON.stringify(selected, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

    const orderData = selected.order;
    const signature = selected.signature;

    // Target: Spend 0.0001 USDC
    const targetSpendUSDC = 0.0001;
    const targetSpendUnits = BigInt(Math.floor(targetSpendUSDC * 1e6)); // 100 units
    const pricePerContract = BigInt(orderData.price); // Scaled 1e6 usually

    const referrer = envVars['NEXT_PUBLIC_THETANUTS_REFERRER_ADDRESS'] || '0x0000000000000000000000000000000000000000';
    console.log(`Referrer: ${referrer}`);

    // amount (wei) = (SpendUnits * 1e18) / Price
    // Example: Spend 100. Price 1,000,000 (1 USDC). NumContracts = 100 * 1e18 / 1e6 = 100 * 1e12 = 1e14.
    // 1e14 wei is 0.0001 ETH worth of contracts.
    
    let numContractsToFill = (targetSpendUnits * BigInt(1e18)) / pricePerContract;
    
    // Safety check: ensure > 1e12 (0.000001 contracts) as per user notes on minimums
    // "Users shd be able to take ... as little as 0.000001 contracts"
    if (numContractsToFill < 1000000000000n) {
        console.log("Calculated contracts too small. Boosting to min 1e12 (0.000001 contracts).");
        numContractsToFill = 1000000000000n;
    }

    console.log(`Target Spend: ${targetSpendUSDC} USDC (approx)`);
    console.log(`Contracts to fill (wei): ${numContractsToFill.toString()}`);

    // APPROVE
    console.log("\nApproving USDC...");
    // Approve slightly more to be safe
    const approveTx = await client.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [OPTION_BOOK_ADDRESS, targetSpendUnits * 10n] // 10x buffer
    });
    console.log(`Approve TX Hash: ${approveTx}`);
    await client.waitForTransactionReceipt({ hash: approveTx });
    console.log("Approved confirmed.");

    // FILL ORDER
    console.log("\nExecuting fillOrder...");
    
    const orderParam = {
        maker: orderData.maker,
        orderExpiryTimestamp: BigInt(orderData.orderExpiryTimestamp),
        collateral: orderData.collateral,
        isCall: orderData.isCall,
        priceFeed: orderData.priceFeed,
        implementation: orderData.implementation,
        isLong: orderData.isLong,
        maxCollateralUsable: BigInt(orderData.maxCollateralUsable),
        strikes: orderData.strikes.map((s: any) => BigInt(s)),
        expiry: BigInt(orderData.expiry),
        price: BigInt(orderData.price),
        extraOptionData: orderData.extraOptionData as `0x${string}`
    };

    try {
        const fillTx = await client.writeContract({
            address: OPTION_BOOK_ADDRESS,
            abi: OPTION_BOOK_ABI,
            functionName: 'fillOrder',
            args: [
                orderParam,
                signature as `0x${string}`,
                numContractsToFill,
                account.address // referrer
            ]
        });
        console.log(`\nSUCCESS! Transaction Sent.`);
        console.log(`TX Hash: ${fillTx}`);
        console.log(`Explorer: https://basescan.org/tx/${fillTx}`);
    } catch (e) {
        console.error("\nTransaction Failed:");
        console.error(e);
    }
}

main().catch(console.error);
