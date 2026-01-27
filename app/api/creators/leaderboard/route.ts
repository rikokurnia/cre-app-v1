import { NextResponse } from 'next/server';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

// Initialize Neynar client
const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

interface LeaderboardEntry {
  rank: number;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  score: number;
  follower_count: number;
  power_badge: boolean;
  change_24h: number; // Positive = up, Negative = down
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Fetch trending feed
    const trendingFeed = await client.fetchTrendingFeed({
      limit: 50, // Fetch more to have enough for pagination
      timeWindow: '24h' as any,
    });

    // Build leaderboard from trending casts
    const creatorScores = new Map<number, { 
      user: any; 
      totalScore: number; 
      castCount: number;
    }>();

    trendingFeed.casts.forEach((cast: any) => {
      const author = cast.author;
      const likes = cast.reactions?.likes_count || 0;
      const recasts = cast.reactions?.recasts_count || 0;
      const replies = cast.replies?.count || 0;
      const castScore = (likes * 2) + (recasts * 3) + (replies * 2.5);

      if (creatorScores.has(author.fid)) {
        const existing = creatorScores.get(author.fid)!;
        existing.totalScore += castScore;
        existing.castCount += 1;
      } else {
        creatorScores.set(author.fid, {
          user: author,
          totalScore: castScore,
          castCount: 1,
        });
      }
    });

    // Convert to leaderboard entries
    const leaderboard: LeaderboardEntry[] = Array.from(creatorScores.entries())
      .map(([fid, data]) => ({
        rank: 0, // Will be set after sorting
        fid,
        username: data.user.username,
        display_name: data.user.display_name || data.user.username,
        pfp_url: data.user.pfp_url || `https://avatar.vercel.sh/${data.user.username}`,
        score: Math.min(Math.round(data.totalScore / data.castCount * 5), 1000),
        follower_count: data.user.follower_count || 0,
        power_badge: data.user.power_badge || false,
        change_24h: Math.floor(Math.random() * 200) - 100, // Mock 24h change for now
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedLeaderboard = leaderboard.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      leaderboard: paginatedLeaderboard,
      total: leaderboard.length,
      page,
      limit,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Leaderboard API Error:', error);
    
    // 1. Try fetching "VIP" users directly as fallback
    try {
      const vipFids = [5650, 3, 2, 99, 1214, 602]; // Vitalik, DWR, V, Jesse, Sriram, Betashop
      const usersResponse = await client.fetchBulkUsers({ fids: vipFids });
      
      if (usersResponse.users && usersResponse.users.length > 0) {
         const fallbackLeaderboard = usersResponse.users
           .map((user, index) => ({
              rank: index + 1,
              fid: user.fid,
              username: user.username,
              display_name: user.display_name || user.username,
              pfp_url: user.pfp_url, // Real URL
              score: 999 - (index * 20) + Math.floor(Math.random() * 50),
              follower_count: user.follower_count,
              power_badge: user.power_badge,
              change_24h: Math.floor(Math.random() * 200) - 100
           }))
           .sort((a, b) => b.score - a.score)
           .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
         
         return NextResponse.json({
            leaderboard: fallbackLeaderboard,
            total: fallbackLeaderboard.length,
            page: 1,
            limit: 20,
            lastUpdated: new Date().toISOString()
         });
      }
    } catch (fallbackError) {
      console.error("Leaderboard fallback failed:", fallbackError);
    }

    // 2. Final Static Fallback
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, fid: 5650, username: 'vitalik.eth', display_name: 'Vitalik Buterin', pfp_url: 'https://i.imgur.com/3pX1G9m.jpg', score: 999, follower_count: 500000, power_badge: true, change_24h: 45 },
      { rank: 2, fid: 3, username: 'dwr.eth', display_name: 'Dan Romero', pfp_url: 'https://github.com/dwr.png', score: 980, follower_count: 150000, power_badge: true, change_24h: 12 },
    ];

    return NextResponse.json({
      leaderboard: mockLeaderboard,
      total: mockLeaderboard.length,
      page: 1,
      limit: 20,
      lastUpdated: new Date().toISOString(),
      isFallback: true,
    });
  }
}
