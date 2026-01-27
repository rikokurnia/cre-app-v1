"use client";

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity, EthBalance } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
       router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-[#A1E3F9] flex flex-col items-center justify-center relative overflow-hidden">
       {/* Background Grid - Reused from Landing but static or simpler */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#3674B5_1px,transparent_1px),linear-gradient(to_bottom,#3674B5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

       <div className="z-10 flex flex-col items-center gap-8 p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#A1E3F9] max-w-md w-full text-center">
          
          <div className="w-24 h-24 bg-[#578FCA] rounded-full flex items-center justify-center mb-4 animate-bounce shadow-lg border-4 border-[#D1F8EF]">
             {/* Nova Icon Placeholder */}
             <span className="text-4xl">🌟</span>
          </div>

          <h1 className="font-heading text-4xl text-[#3674B5]">
            Enter the Arena
          </h1>
          
          <p className="font-body text-[#3674B5]/80 text-lg">
            Connect your wallet to start predicting trending creators on Base.
          </p>

          <div className="mt-4">
             <Wallet>
                <ConnectWallet className="px-8 py-3 bg-[#3674B5] hover:bg-[#2A598A] text-white rounded-lg font-heading transition-all shadow-md">
                   <Avatar className="h-6 w-6" />
                   <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                    Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
             </Wallet>
          </div>

          <p className="text-xs text-[#3674B5]/50 mt-4">
            Powered by OnchainKit & Base
          </p>
       </div>
    </div>
  );
}
