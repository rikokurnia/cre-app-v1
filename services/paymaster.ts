import { createSmartAccountClient, PaymasterMode, Bundler } from "@biconomy/account";
import { THETANUTS_CONFIG, CHAIN_CONFIG } from "@/config/thetanuts";
import { WalletClient, encodeFunctionData, Hex } from "viem";

export interface Transaction {
  to: string;
  data: Hex;
  value?: bigint;
}

export const PaymasterService = {
  
  /**
   * Create Biconomy Smart Account Client
   */
  createClient: async (walletClient: any, address: string) => {
    if (!THETANUTS_CONFIG.PAYMASTER.API_KEY) {
        console.warn("Missing Biconomy API Key");
        return null;
    }

    try {
        // Create Biconomy Smart Account
        // Using biconomyPaymasterApiKey is the preferred way in v4
        const smartAccount = await createSmartAccountClient({
            signer: walletClient,
            bundlerUrl: THETANUTS_CONFIG.PAYMASTER.BUNDLER_URL,
            biconomyPaymasterApiKey: THETANUTS_CONFIG.PAYMASTER.API_KEY,
            chainId: CHAIN_CONFIG.id,
        });
        return smartAccount;
    } catch (error) {
        console.error("Error creating Biconomy client:", error);
        return null;
    }
  },

  /**
   * Execute Sponsored Transaction (Supports Batching)
   */
  executeSponsored: async (
      smartAccount: any, 
      transactions: Transaction | Transaction[]
  ) => {
    try {
        const txs = Array.isArray(transactions) ? transactions : [transactions];
        
        console.log(`Building UserOp for ${txs.length} transactions...`);
        
        // In v4, we can simply use sendTransaction with the sponsored mode
        const userOpResponse = await smartAccount.sendTransaction(txs, {
            paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        });

        console.log("UserOp sent. Waiting for transaction hash...");
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash:", transactionHash);
        
        return transactionHash;
        
    } catch (error: any) {
        console.error("Transaction Failed:", error);
        
        // Handle specific AA21 error more gracefully
        if (error.message && error.message.includes("AA21")) {
            throw new Error("Sponsorship Failed: Paymaster rejected the transaction. Check your Gas Tank or Policy.");
        }
        
        throw error;
    }
  }
};
