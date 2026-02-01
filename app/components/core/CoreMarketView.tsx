'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Moon, TrendingUp, Zap, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAccount, useBalance } from 'wagmi';
import { THETANUTS_CONFIG } from '@/config/thetanuts';
import { fetchOptionBook, getStrikesForExpiry, type OptionChainData, type OptionQuote } from '../../services/thetanuts-v4';
import { PriceService, type MarketPrice } from '../../services/price';
import OrderConfirmationModal from './OrderConfirmationModal';

// --- ASSETS ---
const ASSETS = [
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: '/logo_token/eth-icon.png', configKey: 'WETH' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '/logo_token/btc-icon.png', configKey: 'CBETH' },
];

const EXPIRY_OPTIONS = [1, 2, 3, 7, 28];

// --- MODES ---
type TradeMode = 'UP' | 'DOWN';

import { useUserStore } from '@/app/store/useUserStore';
  
  // Custom Tooltip Sync Component (Defined outside for performance)
  const CustomTooltipSync = ({ active, payload, setHoverData }: any) => {
      useEffect(() => {
         if (active && payload && payload.length) {
             setHoverData(payload[0].payload);
         }
      }, [active, payload, setHoverData]);
      return null;
  };
  
  // Custom Countdown Timer Component
  const CountdownTimer = ({ targetDate }: { targetDate: number }) => {
      const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);
  
      useEffect(() => {
          const interval = setInterval(() => {
              const now = new Date();
              const diff = targetDate - now.getTime();
  
              if (diff <= 0) {
                  setTimeLeft({d:0, h:0, m:0, s:0});
                  clearInterval(interval);
                  return;
              }
  
              setTimeLeft({
                  d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                  m: Math.floor((diff / 1000 / 60) % 60),
                  s: Math.floor((diff / 1000) % 60),
              });
          }, 1000);
  
          return () => clearInterval(interval);
      }, [targetDate]);
  
      if (!timeLeft) return <span className="font-mono text-gray-500 text-[10px]">--:--</span>;
  
      return (
          <span className="font-mono text-gray-400 text-[9px]">
               {timeLeft.d}d {timeLeft.h.toString().padStart(2,'0')}:{timeLeft.m.toString().padStart(2,'0')}:{timeLeft.s.toString().padStart(2,'0')}
          </span>
      );
  };
  
  export default function CoreMarketView() {
    // Mock Balance from Store
    const { virtualBalance } = useUserStore();
    const userBalance = virtualBalance;
    
    // State
    const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
    const [mode, setMode] = useState<TradeMode>('UP');
    const [expiry, setExpiry] = useState(1); // Days
    // Initialize with 0 for logic consistency (ATM/OTM boundary)
    const [strikeIndex, setStrikeIndex] = useState(0); 
    const [amount, setAmount] = useState<string>('');
    const [hoverData, setHoverData] = useState<{ price: number, pnl: number, profitPct: number } | null>(null);
    const [marketData, setMarketData] = useState<OptionChainData | null>(null);
    const [priceInfo, setPriceInfo] = useState<MarketPrice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Market Data (OptionBook) & CoinGecko Prices
  useEffect(() => {
    const fetchMarket = async () => {
        const assetKey = selectedAsset.symbol as 'ETH' | 'BTC'; 
        console.log(`%c[Thetanuts API] Fetching ${assetKey}...`, 'color: #3674B5; font-weight: bold;');
        
        // Concurrent Fetch
        const [tnutsData, binanceData] = await Promise.all([
            fetchOptionBook(assetKey),
            PriceService.getMarketPrice(assetKey)
        ]);
        
        // --- VERIFICATION LOG ---
        console.log(`%c[Thetanuts API] DATA RECEIVED for ${assetKey}:`, 'color: #4CAF50; font-weight: bold;', {
            thetanutsIdx: tnutsData.currentPrice,
            binancePrice: binanceData.price,
            change24h: binanceData.change24h,
            totalQuotes: tnutsData.quotes.length
        });
        
        setMarketData(tnutsData);
        setPriceInfo(binanceData);
    };
    fetchMarket();
    // Poll every 30s
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Use Real Price from Binance/PriceService (Priority) > Market Data > Static Fallback
  const currentPrice = priceInfo?.price || marketData?.currentPrice || (selectedAsset.id === 'ethereum' ? 2705.13 : 85000.00); 
  const priceChange = priceInfo?.change24h || 0; 

  // Generate Strike Prices from Real Data
  const strikes = useMemo(() => {
    if (!marketData) return [];
    
    // Pass 'currentPrice' (Binance or Real) as override to ensure ATM is centered correctly
    const results = getStrikesForExpiry(marketData, expiry, mode as 'UP' | 'DOWN', currentPrice);
    
    // --- STRIKE VERIFICATION LOG ---
    console.log(`%c[Thetanuts PROOF] Generated Strikes for ${expiry}D (${mode}):`, 'color: #FF9800; font-weight: bold;', results);
    
    return results.slice(0, 4); 
  }, [marketData, expiry, mode, currentPrice]);

  const selectedStrike = strikes[strikeIndex] || strikes[0] || (typeof currentPrice === 'number' ? currentPrice : 0);

  // Calculate Real Premium & Find Matching Quote
  const getSelectedQuote = () => {
    if (!marketData || !marketData.quotes) return null;

    const targetExpiryMs = marketData.expiryMap[expiry] || (Date.now() + expiry * 86400000);
    
    const found = marketData.quotes.find(q => {
        // Strike Matching with tolerance
        const strikeMatch = Math.abs(q.strike - selectedStrike) < 0.0001;
        
        // Expiry Matching (Day-level tolerance)
        const diffMs = q.expiry.getTime() - Date.now();
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const expiryMatch = Math.abs(days - expiry) <= 1; // +/- 1 day tolerance
        
        // Type Matching
        const typeMatch = q.type === (mode === 'UP' ? 'Call' : 'Put');

        return strikeMatch && expiryMatch && typeMatch;
    });



    console.log(`%c[PREMIUM DEBUG] Looking for: Strike=${selectedStrike} Expiry=${expiry}D Mode=${mode}`, 'color: cyan', {
        found: !!found,
        premium: found?.premium,
        availablePremium: found?.availablePremium,
        expiryQuote: found?.expiry,
        totalQuotes: marketData.quotes.length
    });

    return found;
  };
  
  const activeQuote = getSelectedQuote();
  
  // Logic Fix: 'amount' input is the actual Premium the user wants to pay.
  const inputAmount = parseFloat(amount || '0');
  const estimatedPremium = inputAmount; // The user specified what they want to spend
  
  // Contracts = Premium / Price_Per_Contract
  const contractsCount = activeQuote ? (inputAmount / activeQuote.premium) : 0;
  
  // Liquidity Check: Is user trying to pay more premium than available in the order?
  const availableLiquidity = activeQuote?.availablePremium || 0;
  const isLiquidityExceeded = inputAmount > availableLiquidity && availableLiquidity > 0;
  
  const isValidAmount = inputAmount >= 0.000001 && !isLiquidityExceeded; 

  // --- CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    const data = [];
    const vizPremium = parseFloat(amount || '0') || 10; // Use input premium or fallback for viz
    const currentContracts = activeQuote ? (vizPremium / activeQuote.premium) : (vizPremium / (selectedStrike * 0.02 || 1));

    // CENTER CHART ON STRIKE PRICE (The Elbow)
    const rangePct = 0.20; // 20% range around Strike
    const startPrice = selectedStrike * (1 - rangePct); 
    const endPrice = selectedStrike * (1 + rangePct);
    const steps = 60; // Fewer steps for better performance
    const stepSize = (endPrice - startPrice) / steps;

    for (let i = 0; i <= steps; i++) {
        const p = startPrice + (i * stepSize);
        let payoff = 0;
        
        if (mode === 'UP') {
            payoff = currentContracts * Math.max(0, p - selectedStrike);
        } else {
            payoff = currentContracts * Math.max(0, selectedStrike - p);
        }
        
        const profit = payoff - vizPremium;
        const profitPct = (profit / vizPremium) * 100;
        
        data.push({
            price: p,
            pnl: profit,
            profitPct: profitPct
        });
    }
    return data;
  }, [selectedStrike, mode, amount, activeQuote]);

  // Derived Stats for Display
  const displayPrice = hoverData ? hoverData.price : currentPrice;
  const activeHoverData = chartData.reduce((prev, curr) => 
    Math.abs(curr.price - displayPrice) < Math.abs(prev.price - displayPrice) ? curr : prev
  , chartData[0] || { profitPct: -100, pnl: -inputAmount });

  const displayProfitPct = activeHoverData.profitPct;
  const displayPnL = activeHoverData.pnl;

  // Presets
  const handlePreset = (pct: number) => {
    // Ideally use real balance, but for now mock max usable or use userBalance if > 0
    const basis = userBalance > 0 ? userBalance : 1000; 
    setAmount((basis * (pct / 100)).toFixed(2));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2">
      
      {/* ================= LEFT COLUMN: CONTROLS (70%) ================= */}
      <div className="lg:flex-[0.7] space-y-6">
        
        {/* TOKEN SELECTOR & PRICE */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
               {/* Token Type Toggle */}
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Token Type</span>
                  <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-2">
                      {ASSETS.map((asset) => (
                          <button
                            key={asset.id}
                            onClick={() => { setSelectedAsset(asset); setStrikeIndex(3); }}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-lg font-bold transition-all ${
                                selectedAsset.id === asset.id 
                                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                              <img src={asset.icon} alt={asset.name} className="w-8 h-8 rounded-full" />
                              {asset.symbol}
                          </button>
                      ))}
                  </div>
               </div>

               {/* Live Price */}
               <div className="text-right self-end pb-1">
                   <div className="text-3xl font-black font-mono text-gray-900 tracking-tight">
                       ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </div>
                   <div className={`text-[10px] font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1 mt-1`}>
                       {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}% (24h)
                   </div>
               </div>
            </div>
        </div>


        <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-2">
            <button
               onClick={() => { setMode('UP'); setStrikeIndex(0); }}
               className={`py-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                   mode === 'UP' 
                   ? 'bg-linear-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 shadow-md transform scale-[1.02]' 
                   : 'bg-white border-transparent text-gray-400 hover:bg-gray-50'
               }`}
            >
                <ArrowUp size={32} className={mode === 'UP' ? 'text-green-500' : 'text-gray-300'} strokeWidth={3} />
                <span className="font-heading font-black text-lg tracking-wider">PRICE UP</span>
            </button>
            
            <button
               onClick={() => { setMode('DOWN'); setStrikeIndex(3); }}
               className={`py-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                   mode === 'DOWN' 
                   ? 'bg-linear-to-br from-red-50 to-rose-50 border-red-500 text-red-700 shadow-md transform scale-[1.02]' 
                   : 'bg-white border-transparent text-gray-400 hover:bg-gray-50'
               }`}
            >
                <ArrowDown size={32} className={mode === 'DOWN' ? 'text-red-500' : 'text-gray-300'} strokeWidth={3} />
                <span className="font-heading font-black text-lg tracking-wider">PRICE DOWN</span>
            </button>
        </div>

        {/* EXPIRY SELECTOR */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Expiry Date</span>
            <div className="flex justify-between gap-2 overflow-x-auto hide-scrollbar">
                {(marketData?.expiries?.length ? marketData.expiries : EXPIRY_OPTIONS).map((d) => {
                    const isActive = expiry === d;
                    return (
                        <button
                            key={d}
                            onClick={() => setExpiry(d)}
                            className={`flex-1 min-w-15 py-3 rounded-xl transition-all border flex flex-col items-center justify-center gap-1 ${
                                isActive
                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-sm font-bold">{d}D</span>
                            {isActive && (
                                <div className="text-[9px] font-bold text-gray-300 opacity-90 -mt-0.5">
                                    <CountdownTimer targetDate={marketData?.expiryMap?.[d] || (Date.now() + d * 86400000)} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* STRIKE PRICE SLIDER */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-4">
             {/* Header with Styled Strike Price Pill - No Float, Inside Card */}
             <div className="flex justify-between items-end mb-12">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {mode === 'UP' ? 'ATM (Safer)' : 'OTM (Riskier)'}
                </span>
                
                {/* Standard Badge placement */}
                <div className="flex flex-col items-center bg-[#3674B5] rounded-3xl px-8 py-4 shadow-lg -mt-2">
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mb-1">
                        Strike Price
                    </span>
                    <div className="text-3xl font-black font-mono text-white tracking-tight">
                        ${selectedStrike.toLocaleString()}
                    </div>
                </div>

                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {mode === 'UP' ? 'OTM (Riskier)' : 'ATM (Safer)'}
                </span>
             </div>

             <div className="relative px-2 py-2">
                 {/* Top Labels (Prices) - Fixed Alignment & Spacing */}
                 <div className="flex justify-between mb-6 px-2.5 absolute -top-8 w-full left-0 pointer-events-none z-10">
                    {strikes.map((s: number, i: number) => (
                        <div key={s} className="w-2 flex justify-center relative">
                            <span className={`text-[10px] font-bold ${i === strikeIndex ? 'text-gray-900' : 'text-gray-400'} transition-colors absolute -top-1 whitespace-nowrap`}>
                                {(s/1000).toFixed(2)}k
                            </span>
                        </div>
                    ))}
                 </div>
                 
                 {/* Track Line */}
                 <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2"></div>

                 {/* Filled Progress Line */}
                 <div 
                    className={`absolute top-1/2 h-2 rounded-full -translate-y-1/2 transition-all duration-300 pointer-events-none ${
                        mode === 'UP' ? 'left-0 bg-green-500' : 'right-0 bg-red-500'
                    }`}
                    style={{ 
                        width: mode === 'UP' 
                            ? `${(strikeIndex / (strikes.length - 1 || 3)) * 100}%` 
                            : `${((strikes.length - 1 - strikeIndex) / (strikes.length - 1 || 3)) * 100}%`
                    }}
                 ></div>
                 
                 {/* Dots */}
                 <div className="absolute top-1/2 left-0 w-full flex justify-between px-2.5 -translate-y-1/2 pointer-events-none z-0">
                    {strikes.map((s, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${
                            i === strikeIndex 
                            ? (mode === 'UP' ? 'bg-green-500 scale-125 shadow-sm' : 'bg-red-500 scale-125 shadow-sm')
                            : 'bg-gray-300'
                        }`}></div>
                    ))}
                 </div>

                 <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={strikeIndex}
                    onChange={(e) => setStrikeIndex(parseInt(e.target.value))}
                    className={`
                        w-full h-2 bg-transparent appearance-none cursor-pointer relative z-10 focus:outline-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:border-4
                        [&::-webkit-slider-thumb]:border-white
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-all
                        ${mode === 'UP' 
                            ? '[&::-webkit-slider-thumb]:bg-green-500 hover:[&::-webkit-slider-thumb]:scale-110' 
                            : '[&::-webkit-slider-thumb]:bg-red-500 hover:[&::-webkit-slider-thumb]:scale-110'
                        }
                    `}
                 />
                 
                 <div className="flex justify-between mt-2 px-1">
                     <span className="text-[9px] font-bold text-gray-300">
                        {mode === 'UP' ? 'ATM' : 'OTM'}
                     </span>
                     <span className="text-[9px] font-bold text-gray-400">
                     </span>
                     <span className="text-[9px] font-bold text-gray-300">
                        {mode === 'UP' ? 'OTM' : 'ATM'}
                     </span>
                 </div>
             </div>
        </div>

        {/* INPUTS & LAUNCH */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            
            {/* Amount Input */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invest Amount (USDC)</label>
                    <span className="text-[10px] font-bold text-gray-400 opacity-60">Remain Saldo: ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-[55%]">
                        <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-10 font-mono text-xl font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-gray-900"
                        placeholder="0.00"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    </div>
                    {/* Presets */}
                    <div className="flex-1 flex gap-2">
                        {[25, 50, 100].map(pct => (
                            <button 
                                key={pct} 
                                onClick={() => handlePreset(pct)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-bold text-gray-500 transition-all border border-gray-100"
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

             {/* Available Premium Display - LINKED TO API */}
             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                     {isLiquidityExceeded ? 'Insufficient Liq.' : 'Available Premium'}
                 </span>
                 <span className={`text-sm font-black font-mono tracking-tight ${isLiquidityExceeded ? 'text-red-500' : 'text-gray-900'}`}>
                     ${activeQuote?.availablePremium ? activeQuote.availablePremium.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                 </span>
             </div>

             <div className="pt-2">
                 <motion.button
                    whileHover={isValidAmount ? { scale: 1.02 } : {}}
                    whileTap={isValidAmount ? { scale: 0.98 } : {}}
                    disabled={!isValidAmount}
                    onClick={() => setIsModalOpen(true)}
                    className={`
                        w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all
                        ${isValidAmount 
                        ? (mode === 'UP' ? 'bg-[#22C55E] text-white shadow-lg' : 'bg-[#EF4444] text-white shadow-lg') 
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'}`}
                 >
                   <Zap size={24} className={isValidAmount ? "fill-current animate-pulse" : ""} />
                   {isLiquidityExceeded ? "LIQUIDITY EXCEEDED" : (isValidAmount ? "PROCESS ORDER" : "MIN 0.0001 USDC")}
                 </motion.button>
               </div>
        </div>

      </div>

      {/* ================= RIGHT COLUMN: CHART & ANALYSIS (30%) ================= */}
       <div className="lg:flex-[0.3] flex flex-col gap-3">
          
          {/* CHART CARD */}
          <div className="bg-white rounded-3xl p-5 border border-[#317ac4] shadow-sm relative overflow-visible flex flex-col h-70">
              <div className="flex justify-between items-center mb-2 z-10">
                  <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider underline underline-offset-4 decoration-[#A1E3F9]">
                    Option Chart
                  </h3>
                  <div className="text-right">
                      <span className="text-gray-400 text-[9px] uppercase font-bold block">Break Even</span>
                      <span className="text-[#0077B6] font-mono font-bold text-xs">
                       ${(mode === 'UP' 
                             ? selectedStrike + (activeQuote?.premium || (selectedStrike * 0.02))
                             : selectedStrike - (activeQuote?.premium || (selectedStrike * 0.02))
                          ).toFixed(0)}
                      </span>
                  </div>
              </div>

               <div className="flex-1 w-full relative z-10 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                         data={chartData} 
                         margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
                         onMouseLeave={() => setHoverData(null)}
                      >
                     <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
                                <stop offset={0.5} stopColor={mode === 'UP' ? "#ef4444" : "#22c55e"} stopOpacity={1} />
                                <stop offset={0.5} stopColor={mode === 'UP' ? "#22c55e" : "#ef4444"} stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis 
                            dataKey="price" 
                            hide={false} 
                            tick={{fill: '#9ca3af', fontSize: 9}} 
                            tickFormatter={(val) => `${(val/1000).toFixed(1)}k`}
                            axisLine={false}
                            tickLine={false}
                            dy={5}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                            content={<CustomTooltipSync setHoverData={setHoverData} />} 
                            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
                         {/* Centered Strike Line (The Elbow) */}
                        <ReferenceLine 
                            x={selectedStrike} 
                            stroke="#A1E3F9" 
                            strokeDasharray="4 4" 
                            strokeOpacity={1} 
                            strokeWidth={2}
                        />
                        <ReferenceLine x={currentPrice} stroke="#cbd5e1" strokeDasharray="2 2" strokeOpacity={0.8} label={{ value: 'Curr', fill: '#94a3b8', fontSize: 9, position: 'insideTop' }} />
                        <Line 
                            type="monotone" 
                            dataKey="pnl" 
                            stroke="url(#splitColor)" 
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 5, fill: '#fff', strokeWidth: 2, stroke: '#0077B6' }}
                        />
                     </LineChart>
                 </ResponsiveContainer>
              </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#317ac4] rounded-2xl p-3 h-20 flex flex-col justify-center shadow-sm">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Price</span>
                  <div className="text-xl font-black text-gray-900 font-mono">
                      ${displayPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
              </div>
              <div className="bg-white border border-[#317ac4] rounded-2xl p-3 h-20 flex flex-col justify-center shadow-sm">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Profit (%)</span>
                  <div className={`text-xl font-black font-mono ${displayProfitPct >= 0 ? 'text-[#0077B6]' : 'text-red-400'}`}>
                      {displayProfitPct > 0 ? '+' : ''}{displayProfitPct.toFixed(1)}%
                  </div>
              </div>
              <div className="bg-white border border-[#317ac4] rounded-2xl p-3 h-20 flex flex-col justify-center shadow-sm">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mb-1">P&L ($)</span>
                  <div className={`text-xl font-black font-mono ${displayPnL >= 0 ? 'text-[#0077B6]' : 'text-red-400'}`}>
                      {displayPnL >= 0 ? '+' : ''}{Math.round(displayPnL).toLocaleString()} 
                  </div>
              </div>
              <div className="bg-white border border-[#317ac4] rounded-2xl p-3 h-20 flex flex-col justify-center shadow-sm">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Contracts</span>
                  <div className="text-xl font-black text-gray-900 font-mono truncate">
                      {contractsCount.toFixed(3)}
                  </div>
              </div>
          </div>
      </div>

       {/* MODAL */}
       <AnimatePresence>
        {isModalOpen && (
            <OrderConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orderData={{
                    asset: selectedAsset.symbol,
                    strike: selectedStrike,
                    expiry: expiry,
                    amount: inputAmount,
                    contracts: contractsCount,
                    premium: estimatedPremium,
                    quote: activeQuote,
                    optionBookAddress: marketData?.optionBookAddress
                }}
                onSuccess={(hash) => {
                    // Success handling - Trigger Toast
                    import('sonner').then(({ toast }) => {
                        toast.success('Order Executed Successfully!', {
                            description: `Transaction Hash: ${hash.slice(0, 6)}...${hash.slice(-4)}`,
                            duration: 5000,
                        });
                        // Redirect to My Positions after validation (small delay for UX)
                        setTimeout(() => {
                           window.location.href = '/dashboard/portfolio';
                        }, 1000);
                    });
                }}
            />
        )}
       </AnimatePresence>

    </div>
  );
}