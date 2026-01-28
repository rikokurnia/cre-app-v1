import { AgentKit, CdpEvmWalletProvider } from "@coinbase/agentkit";
import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";

let cachedAgentKit: AgentKit | null = null;
let cachedTools: Record<string, unknown> = {};

export async function getAgentTools() {
  // Return cached if available
  if (cachedAgentKit && Object.keys(cachedTools).length > 0) {
    return { agentKit: cachedAgentKit, tools: cachedTools };
  }

  const cdpApiKeyId = process.env.CDP_API_KEY_ID;
  const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
  const cdpWalletSecret = process.env.CDP_WALLET_SECRET;
  const networkId = process.env.NETWORK_ID || "base-mainnet";

  // Check if keys are present
  if (!cdpApiKeyId || !cdpApiKeySecret || !cdpWalletSecret) {
    console.error("CDP credentials missing:", {
      hasApiKeyId: !!cdpApiKeyId,
      hasApiKeySecret: !!cdpApiKeySecret,
      hasWalletSecret: !!cdpWalletSecret,
    });
    return { agentKit: null, tools: {} };
  }

  try {
    console.log("Initializing AgentKit with network:", networkId);
    
    // Configure wallet provider for EVM (Base)
    const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
      apiKeyId: cdpApiKeyId,
      apiKeySecret: cdpApiKeySecret,
      walletSecret: cdpWalletSecret,
      networkId: networkId,
    });

    // Create AgentKit with wallet provider
    const agentKit = await AgentKit.from({
      walletProvider,
    });

    const tools = await getVercelAITools(agentKit);
    
    // Cache the results
    cachedAgentKit = agentKit;
    cachedTools = tools;
    
    console.log("AgentKit initialized successfully. Tools available:", Object.keys(tools).length);
    return { agentKit, tools };
  } catch (error) {
    console.error("Failed to initialize AgentKit:", error);
    return { agentKit: null, tools: {} };
  }
}
