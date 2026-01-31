import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const neynarConfig = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

// Top 6 Legends FIDs (Whitelist)
const LEGENDS = [
  { fid: 616, name: 'Vitalik Buterin', username: 'vitalik.eth' },
  { fid: 5650, name: 'Jesse Pollak', username: 'jessepollak' }, // Base
  { fid: 3, name: 'Dan Romero', username: 'dwr.eth' }, // Farcaster
  { fid: 2433, name: 'Balaji Srinivasan', username: 'balajis.eth' },
  { fid: 1689, name: 'Sriram Krishnan', username: 'sriramk.eth' },
  { fid: 12142, name: 'Betashop', username: 'betashop.eth' },
];

// Simple In-Memory Cache (Key = FID)
const FEED_CACHE = new Map<number, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 });
    }

    const targetFid = parseInt(fidParam);
    const creator = LEGENDS.find(c => c.fid === targetFid);

    if (!creator) {
      return NextResponse.json({ error: 'Creator not in whitelist' }, { status: 403 });
    }

    // --- REAL API CALL (WITH CACHE) ---
    
    // Check Cache First
    const cached = FEED_CACHE.get(targetFid);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
       return NextResponse.json(cached.data);
    }

    console.log(`Fetching REAL feed for ${creator.username} (${targetFid})...`);

    // Fetch User Casts
    const feed = await neynarClient.fetchCastsForUser({ fid: targetFid, limit: 15 });
    
    // Transform Data
    const casts = feed.casts.map((cast: any) => ({
        hash: cast.hash,
        author: {
          name: cast.author.display_name,
          username: cast.author.username,
          pfp: cast.author.pfp_url,
          followerCount: cast.author.follower_count,
        },
        text: cast.text,
        timestamp: cast.timestamp,
        likes: cast.reactions.likes_count,
        recasts: cast.reactions.recasts_count,
        replies: cast.replies.count,
        embeds: cast.embeds || []
    }));

    // Group By Date
    const groupedFeed: Record<string, any[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    casts.forEach((cast: any) => {
        const date = new Date(cast.timestamp).toDateString();
        let key = date;
        if (date === today) key = 'Today';
        else if (date === yesterday) key = 'Yesterday';
        else key = new Date(cast.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (!groupedFeed[key]) groupedFeed[key] = [];
        groupedFeed[key].push(cast);
    });

    const responseData = { feed: groupedFeed, count: casts.length };
    
    // Save to Cache
    FEED_CACHE.set(targetFid, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Feed API Error:', error.response?.status || error.message);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
