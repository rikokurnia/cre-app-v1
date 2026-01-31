import { NextRequest, NextResponse } from 'next/server';

const THETANUTS_API_BASE = 'https://optionbook-indexer.thetanuts.finance/api/v1';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch orders from Thetanuts Indexer
    // In dev/test, use the API. In prod, recommend own indexer but API is fine for hackathon MVP
    const response = await fetch(`${THETANUTS_API_BASE}/orders`, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Thetanuts API error: ${response.statusText}`);
    }

    const allOrders = await response.json();

    // 2. Filter for relevant assets (ETH, BTC)
    // We only want CALL/PUT orders for major assets supported by our signals
    const filteredOrders = allOrders.filter((order: any) => {
      const asset = order.underlyingAsset?.toUpperCase();
      return asset === 'ETH' || asset === 'BTC' || asset === 'WETH' || asset === 'CBBTC';
    });

    return NextResponse.json({ 
      orders: filteredOrders,
      count: filteredOrders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch Thetanuts orders:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
