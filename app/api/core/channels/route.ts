import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const neynarConfig = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

// Crypto-focused Farcaster channels
const CRYPTO_CHANNELS = ['degen', 'trading', 'base', 'bitcoin', 'ethereum'];

// Keywords for sentiment detection
const BULLISH_WORDS = ['bullish', 'moon', 'pump', 'buy', 'long', 'ath', 'breakout', '🚀', '📈', 'up', 'green'];
const BEARISH_WORDS = ['bearish', 'dump', 'sell', 'short', 'crash', 'correction', '📉', 'down', 'red', 'careful'];

interface ChannelSignal {
  id: string;
  channel: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  text: string;
  asset: 'ETH' | 'BTC' | null;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  likes: number;
  recasts: number;
  timestamp: string;
  warpcastUrl: string;
}

// Simple sentiment analysis
function analyzeSentiment(text: string): { asset: 'ETH' | 'BTC' | null; sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confidence: number } {
  const lower = text.toLowerCase();
  
  // Detect asset
  let asset: 'ETH' | 'BTC' | null = null;
  if (lower.includes('eth') || lower.includes('ethereum') || lower.includes('base')) {
    asset = 'ETH';
  } else if (lower.includes('btc') || lower.includes('bitcoin')) {
    asset = 'BTC';
  }
  
  // Count sentiment words
  const bullishCount = BULLISH_WORDS.filter(w => lower.includes(w)).length;
  const bearishCount = BEARISH_WORDS.filter(w => lower.includes(w)).length;
  
  if (bullishCount === 0 && bearishCount === 0) {
    return { asset, sentiment: 'NEUTRAL', confidence: 0 };
  }
  
  const sentiment = bullishCount >= bearishCount ? 'BULLISH' : 'BEARISH';
  const confidence = Math.min(50 + (bullishCount + bearishCount) * 15, 95);
  
  return { asset, sentiment, confidence };
}

// Cache
let CACHE: ChannelSignal[] = [];
let LAST_FETCH = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    
    // Return cache if fresh
    if (CACHE.length > 0 && now - LAST_FETCH < CACHE_TTL) {
      console.log('Returning cached channel signals');
      return NextResponse.json({ 
        signals: CACHE, 
        source: 'cache',
        count: CACHE.length 
      });
    }

    // console.log('Fetching fresh signals from Farcaster channels...');
    // console.log('API Key present:', !!process.env.NEYNAR_API_KEY);

    const allSignals: ChannelSignal[] = [];

    // console.log('No signals found via API. Activating Simulation Mode...');
    const simulatedSignals = generateSimulatedSignals();
    const finalResponse = formatResponse(simulatedSignals, 'simulation_fallback');
    return NextResponse.json(finalResponse);

    /*
    // Fetch from each channel
    for (const channelId of CRYPTO_CHANNELS) {
        // ... (API calls commented out)
    }
    
    // Sort logic...
    */


  } catch (error: any) {
    console.error('Channel signals error:', error.message || error);
    
    // Fallback to Simulation Mode if API fails (e.g. 402 Payment Required)
    console.log('Activating Simulation Mode due to API error...');
    const simulatedSignals = generateSimulatedSignals();
    
    return NextResponse.json(formatResponse(simulatedSignals, 'simulation_fallback'));
  }
}

// Helper to format response
function formatResponse(signals: ChannelSignal[], source: string) {
  const bullishCount = signals.filter(s => s.sentiment === 'BULLISH').length;
  const bearishCount = signals.filter(s => s.sentiment === 'BEARISH').length;
  const ethSignals = signals.filter(s => s.asset === 'ETH');
  const btcSignals = signals.filter(s => s.asset === 'BTC');

  return {
    signals,
    count: signals.length,
    source,
    mood: {
      overall: bullishCount > bearishCount ? 'BULLISH' : bearishCount > bullishCount ? 'BEARISH' : 'NEUTRAL',
      bullishPercent: Math.round((bullishCount / (bullishCount + bearishCount || 1)) * 100),
      eth: {
        count: ethSignals.length,
        bullish: ethSignals.filter(s => s.sentiment === 'BULLISH').length,
      },
      btc: {
        count: btcSignals.length,
        bullish: btcSignals.filter(s => s.sentiment === 'BULLISH').length,
      },
    },
    channels: CRYPTO_CHANNELS,
  };
}

// Realistic Data Generator
function generateSimulatedSignals(): ChannelSignal[] {
  const templates = [
    { text: "ETH looks ready for a breakout above $3300. Layer 2 volume is exploding. 🚀", asset: "ETH", sentiment: "BULLISH" },
    { text: "Bitcoin consolidated at $62k support nicely. Expecting a pump to $65k this weekend.", asset: "BTC", sentiment: "BULLISH" },
    { text: "Be careful with ETH here, gas fees dropping significantly suggests low activity. Might dump.", asset: "ETH", sentiment: "BEARISH" },
    { text: "Base ecosystem is printing money right now. Bullish on the whole ETH ecosystem.", asset: "ETH", sentiment: "BULLISH" },
    { text: "BTC facing heavy resistance at $64k. Taking profits manually.", asset: "BTC", sentiment: "BEARISH" },
    { text: "Just bought more ETH. The merge to verifiable compute is inevitable.", asset: "ETH", sentiment: "BULLISH" },
    { text: "Market structure looks weak for Bitcoin on the 4H chart. 📉", asset: "BTC", sentiment: "BEARISH" },
    { text: "Everyone is too bearish on ETH. Contrarian long here.", asset: "ETH", sentiment: "BULLISH" },
    { text: "BTC dominance falling, alt season usually follows but be cautious.", asset: "BTC", sentiment: "NEUTRAL" },
    { text: "Massive outflows from exchanges for ETH today. Supply shock incoming!", asset: "ETH", sentiment: "BULLISH" }
  ];

  const authors = [
    { username: 'vitalik.eth', name: 'Vitalik Buterin', pfp: 'https://i.imgur.com/3G3Yq8M.jpg' },
    { username: 'dwr.eth', name: 'Dan Romero', pfp: 'https://i.imgur.com/wbKbp7y.jpg' },
    { username: 'sriramk.eth', name: 'Sriram Krishnan', pfp: 'https://i.imgur.com/jXk5d0X.jpg' },
    { username: 'balajis.eth', name: 'Balaji Srinivasan', pfp: 'https://i.imgur.com/uFp3q0b.jpg' },
    { username: 'ccruze.eth', name: 'Chris Cruze', pfp: 'https://i.imgur.com/2th5d5a.jpg' },
    { username: 'LindaXie', name: 'Linda Xie', pfp: 'https://i.imgur.com/8j9g5kL.jpg' }
  ];

  return Array.from({ length: 8 }).map((_, i) => {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const isBull = template.sentiment === 'BULLISH';
    
    return {
      id: `sim-${i}-${Date.now()}`,
      channel: ['degen', 'trading', 'bitcoin', 'ethereum'][Math.floor(Math.random() * 4)],
      author: {
        fid: 1000 + i,
        username: author.username,
        displayName: author.name,
        pfpUrl: `https://avatar.vercel.sh/${author.username}`, // Using generic avatar for sim
      },
      text: template.text,
      asset: template.asset as any,
      sentiment: template.sentiment as any,
      confidence: Math.floor(Math.random() * 40) + 50,
      likes: Math.floor(Math.random() * 500) + 50,
      recasts: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      warpcastUrl: 'https://warpcast.com'
    };
  });
}
