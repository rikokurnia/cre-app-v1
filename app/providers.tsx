"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css"; // Required for v1.0
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";

// Configure Wagmi
const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "CreatorArena",
      preference: "all", // Support both Smart Wallet and EOA
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});

export function Providers({ children, initialState }: { children: ReactNode; initialState?: State }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              name: "CreatorArena",
              logo: "https://em-content.zobj.net/source/microsoft-teams/363/star_2b50.png",
              mode: "auto",
              theme: "base",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

