"use client";

import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage,
  SwapToast,
} from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import { useCallback } from 'react';

// --- TOKENS (Base Mainnet) ---
const ETH: Token = {
  name: 'ETH',
  address: '',
  symbol: 'ETH',
  decimals: 18,
  image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
  chainId: 8453,
};

const USDC: Token = {
  name: 'USDC',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  symbol: 'USDC',
  decimals: 6,
  image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
  chainId: 8453,
};

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SwapModal({ isOpen, onClose, onSuccess }: SwapModalProps) {
  
  const handleSuccess = useCallback(() => {
    // Wait for animation or state update
    if (onSuccess) {
        setTimeout(onSuccess, 2000);
    }
  }, [onSuccess]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm fixed"
        />

        {/* Modal Content */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 z-[201]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
             <div className="flex items-center gap-2 text-primary font-heading">
                <Wallet size={20} />
                <span>Quick Swap</span>
             </div>
             <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
             </button>
          </div>

          <div className="p-4 bg-gray-50 min-h-[400px]">
            <p className="text-sm text-gray-500 mb-4 text-center">
                Need USDC to trade options? Swap instantly.
            </p>

            <Swap 
                onSuccess={handleSuccess}
                isSponsored // Will enable if Paymaster is set up globally
            >
              <SwapAmountInput
                label="Sell"
                swappableTokens={[ETH]}
                token={ETH}
                type="from"
              />
              <SwapToggleButton />
              <SwapAmountInput
                label="Buy"
                swappableTokens={[USDC]}
                token={USDC}
                type="to"
              />
              <div className="h-4" />
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </Swap>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
