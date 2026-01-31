import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const baseUrl = req.nextUrl.origin;
    const scrapeUrl = new URL('/api/signals/scrape', baseUrl);
    
    const res = await fetch(scrapeUrl.toString(), {
      cache: 'no-store',
    });
    
    // Handle non-JSON responses gracefully
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('Scrape endpoint returned non-JSON:', await res.text());
      return NextResponse.json({ 
        signals: [], 
        error: 'Scrape endpoint unavailable' 
      });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Signals API error:', error);
    return NextResponse.json({ 
      signals: [], 
      error: String(error) 
    });
  }
}
