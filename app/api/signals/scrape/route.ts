import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Initialize Neynar Client
const neynarConfig = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

// Types
interface Signal {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  type: 'BULLISH' | 'BEARISH';
  asset: 'ETH' | 'BTC';
  confidence: number;
  reasoning: string;
  cast_hash: string;
  cast_text: string;
  cast_url: string;
  created_at: string;
  likes: number;
  recasts: number;
}

// In-memory cache
let SIGNAL_CACHE: Signal[] = [];
let LAST_SCRAPE = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Famous crypto signal creators on Farcaster (10 creators)
const CRYPTO_CREATORS = [
  { fid: 616, username: 'v', name: 'Vitalik Buterin' },           // Ethereum founder
  { fid: 3, username: 'dwr', name: 'Dan Romero' },                // Farcaster CEO
  { fid: 5650, username: 'jessepollak', name: 'Jesse Pollak' },   // Base founder
  { fid: 2433, username: 'balajis', name: 'Balaji Srinivasan' },  // Former a16z
  { fid: 1689, username: 'sriramk', name: 'Sriram Krishnan' },    // a16z
  { fid: 12142, username: 'betashop', name: 'Betashop.eth' },     // Crypto trader
  { fid: 239, username: 'ted', name: 'Ted' },                      // Crypto creator
  { fid: 8, username: 'ace', name: 'Ace' },                        // Early Farcaster
  { fid: 576, username: 'lesgreys', name: 'Les Greys' },          // Crypto analyst
  { fid: 680, username: 'binji', name: 'Binji' },                  // NFT/Crypto
];

// Keywords for bullish/bearish detection
const BULLISH_KEYWORDS = ['bullish', 'buy', 'long', 'moon', 'pump', 'ath', 'breakout', 'accumulate', '🚀', '📈', 'up'];
const BEARISH_KEYWORDS = ['bearish', 'sell', 'short', 'dump', 'crash', 'correction', 'resistance', '📉', 'down', 'careful'];
const CRYPTO_KEYWORDS = ['eth', 'btc', 'bitcoin', 'ethereum', '$eth', '$btc', 'base', 'crypto', 'defi'];

// Rule-based sentiment analysis (no AI needed - faster & free)
function analyzeCast(text: string): { type: 'BULLISH' | 'BEARISH' | null, asset: 'ETH' | 'BTC' | null, confidence: number } {
  const lower = text.toLowerCase();
  
  // Check if crypto related
  const isCryptoRelated = CRYPTO_KEYWORDS.some(k => lower.includes(k));
  if (!isCryptoRelated) return { type: null, asset: null, confidence: 0 };
  
  // Determine asset
  let asset: 'ETH' | 'BTC' | null = null;
  if (lower.includes('eth') || lower.includes('ethereum') || lower.includes('base')) {
    asset = 'ETH';
  } else if (lower.includes('btc') || lower.includes('bitcoin')) {
    asset = 'BTC';
  }
  
  // Count sentiment
  let bullishScore = BULLISH_KEYWORDS.filter(k => lower.includes(k)).length;
  let bearishScore = BEARISH_KEYWORDS.filter(k => lower.includes(k)).length;
  
  if (bullishScore === 0 && bearishScore === 0) return { type: null, asset, confidence: 0 };
  
  const type = bullishScore >= bearishScore ? 'BULLISH' : 'BEARISH';
  const confidence = Math.min(50 + (bullishScore + bearishScore) * 15, 95);
  
  return { type, asset: asset || 'ETH', confidence };
}

export async function GET(req: NextRequest) {
  // TEMPORARILY DISABLED TO PREVENT 402/429
  console.log("Signals Scraper: Mock Mode Active");
  return NextResponse.json({ 
    signals: [], 
    count: 0,
    source: 'mock',
    message: "Signals updated (MOCK)"
  });

  /*
  try {
    const now = Date.now();
    
    // Return cached signals if valid
    if (SIGNAL_CACHE.length > 0 && now - LAST_SCRAPE < CACHE_TTL) {
      return NextResponse.json({ signals: SIGNAL_CACHE, source: 'cache', count: SIGNAL_CACHE.length });
    }

    const signals: Signal[] = [];

    // Fetch casts from each creator using FREE endpoint
    // ... loop commented out ...
    
    // ... sorting logic ...
    
    return NextResponse.json({ 
      signals: topSignals, 
      count: topSignals.length,
      source: 'farcaster',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Signal scrape failed:", error);
    return NextResponse.json({ 
      signals: [], 
      count: 0,
      source: 'error',
      error: String(error)
    });
  }
  */
}
