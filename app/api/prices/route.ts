
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  try {
    const symbolKey = symbol === 'ETH' ? 'ETH' : 'BTC';
    // Using CryptoCompare as fallback since Binance is blocked in this environment
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbolKey}&tsyms=USD`;
    
    // Server-side fetch
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
        throw new Error(`Price API Error: ${res.status}`);
    }

    const json = await res.json();
    const raw = json.RAW?.[symbolKey]?.USD;

    if (!raw) {
        throw new Error("Invalid Data from CryptoCompare");
    }

    // Map to match Binance format expected by frontend
    return NextResponse.json({
        lastPrice: raw.PRICE,
        priceChangePercent: raw.CHANGEPCT24HOUR
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
