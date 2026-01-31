import { NextRequest, NextResponse } from 'next/server';

const THETANUTS_API_BASE = 'https://optionbook-indexer.thetanuts.finance/api/v1';
const MY_REFERRER = process.env.THETANUTS_REFERRER_ADDRESS;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // 1. Fetch user positions
    const response = await fetch(`${THETANUTS_API_BASE}/user/${address}/positions`, {
       cache: 'no-store' // Always fresh
    });

    if (!response.ok) {
      throw new Error(`Thetanuts API error: ${response.statusText}`);
    }

    const allPositions = await response.json();

    // 2. Filter by Referrer
    // Only show positions that were created via NovaCreator app
    // If referrer env is not set (dev), return all positions for debugging
    const myPositions = MY_REFERRER 
      ? allPositions.filter((p: any) => p.referrer?.toLowerCase() === MY_REFERRER.toLowerCase())
      : allPositions;

    return NextResponse.json({ 
      positions: myPositions,
      count: myPositions.length
    });

  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
