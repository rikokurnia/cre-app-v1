import { useState, useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { OPTION_BOOK_ADDRESS, USDC_ADDRESS, ERC20_ABI, OPTION_BOOK_ABI } from '../contracts/thetanuts';

interface Order {
  maker: string;
  expiry: string;
  strike: string;
  asset: string;
  type: 'CALL' | 'PUT';
  raw: any; // Raw order object for params
  signature: any;
  premium: number;
}

export function useThetanuts() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  // Fetch orders proxy
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/thetanuts/orders');
      const data = await res.json();
      
      // Parse Orders
      if (data.orders) {
        const parsed = data.orders.map((o: any) => ({
          maker: o.maker,
          expiry: o.expiry,
          strike: o.strikePrices?.[0], // Assuming single strike for simplicity
          asset: o.underlyingAsset,
          type: o.isCall ? 'CALL' : 'PUT',
          premium: parseFloat(o.price) / 1e6, // USDC decimals
          raw: o.order,
          signature: o.signature
        }));
        setOrders(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute Trade Helper
  const fillOrder = async (order: any, amountContracts: number, signature: string, referrer: string) => {
    try {
      if (!referrer) throw new Error("Referrer address is required");

      const tx = await writeContractAsync({
        address: OPTION_BOOK_ADDRESS,
        abi: OPTION_BOOK_ABI,
        functionName: 'fillOrder',
        args: [
          order,          // Order struct
          signature as `0x${string}`,     // Signature bytes
          BigInt(amountContracts), // Num contracts 
          referrer as `0x${string}`       // Referrer address
        ],
      });
      return tx;
    } catch (err) {
      console.error("Fill order failed", err);
      throw err;
    }
  };

  // Enhance approvals later
  
  return {
    orders,
    loading,
    fetchOrders,
    fillOrder,
    OPTION_BOOK_ADDRESS,
    USDC_ADDRESS 
  };
}
