import { NextRequest, NextResponse } from 'next/server';

const THETANUTS_API = "https://round-snowflake-9c31.devops-118.workers.dev/basic-option-book/option-chain";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get('chainId');
  const assetAddress = searchParams.get('assetAddress');

  if (!chainId || !assetAddress) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const url = `${THETANUTS_API}?chainId=${chainId}&assetAddress=${assetAddress}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream API failed: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Thetanuts Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
