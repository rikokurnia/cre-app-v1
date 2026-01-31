require('dotenv').config({ path: '.env' });
const { createSmartAccountClient, PaymasterMode } = require("@biconomy/account");
const { createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { base } = require("viem/chains");

async function verifyBiconomy() {
    console.log("🔍 Verifying Biconomy Configuration...");
    
    const apiKey = process.env.NEXT_PUBLIC_BICONOMY_API_KEY;
    if (!apiKey) throw new Error("Missing NEXT_PUBLIC_BICONOMY_API_KEY");
    console.log(`API Key: ${apiKey}`);

    // Setup Signer (Random is fine for connection test, but using env PK is better if available)
    const signer = privateKeyToAccount(process.env.PRIVATE_KEY || '0x4333333333333333333333333333333333333333333333333333333333333333');
    const walletClient = createWalletClient({
        account: signer,
        chain: base,
        transport: http("https://mainnet.base.org")
    });

    try {
        // Init Client
        const bundlerUrl = "https://bundler.biconomy.io/api/v2/8453/0641785f-bd22-4446-9075-294901a1cd29";
        
        console.log("Connecting to Biconomy...");
        const smartAccount = await createSmartAccountClient({
            signer: walletClient,
            bundlerUrl: bundlerUrl, 
            biconomyPaymasterApiKey: apiKey,
            chainId: 8453,
        });
        
        const saAddress = await smartAccount.getAccountAddress();
        console.log(`✅ Smart Account Initialized: ${saAddress}`);

        // Test Paymaster Connection
        const biconomyPaymaster = smartAccount.paymaster;
        console.log("Testing Paymaster Connection...");
        
        // We can't easily "ping", but we can construct a dummy userOp and ask for PM data
        const userOp = await smartAccount.buildUserOp([{
            to: "0x000000000000000000000000000000000000dead",
            data: "0x",
            value: 0n
        }]);
        
        const pmData = await biconomyPaymaster.getPaymasterAndData(userOp, {
            mode: PaymasterMode.SPONSORED
        });
        
        console.log("✅ Paymaster Response Received (Success!)");
        console.log(pmData);

    } catch (error) {
        console.error("❌ Biconomy Verification Failed:");
        console.error(error.message);
        if (error.messsage && error.message.includes("Paymaster not found")) {
            console.error("\n[DIAGNOSIS] The API Key '" + apiKey + "' is not linked to a Paymaster instance on Base Mainnet (Chain 8453).");
        }
    }
}

verifyBiconomy();
