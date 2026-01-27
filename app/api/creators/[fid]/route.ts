import { NextResponse } from 'next/server';
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

// Initialize Neynar client
const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

// Types
interface CreatorDetail {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  follower_count: number;
  following_count: number;
  power_badge: boolean;
  score: number;
  recent_casts: Cast[];
}

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
}

// Calculate score from engagement
function calculateScoreFromCasts(casts: any[]): number {
  if (!casts.length) return 500;
  
  const totalEngagement = casts.reduce((acc, cast) => {
    const likes = cast.reactions?.likes_count || 0;
    const recasts = cast.reactions?.recasts_count || 0;
    const replies = cast.replies?.count || 0;
    return acc + (likes * 2) + (recasts * 3) + (replies * 2.5);
  }, 0);
  
  const avgEngagement = totalEngagement / casts.length;
  return Math.min(Math.round(avgEngagement * 5), 1000);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params;
    const fidNumber = parseInt(fid, 10);
    
    if (isNaN(fidNumber)) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }

    // Fetch user details
    const usersResponse = await client.fetchBulkUsers({ fids: [fidNumber] });
    
    if (!usersResponse.users || usersResponse.users.length === 0) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const user = usersResponse.users[0];

    // Fetch recent casts for this user
    const castsResponse = await client.fetchCastsForUser({
      fid: fidNumber,
      limit: 10,
    });

    const recentCasts: Cast[] = (castsResponse.casts || []).map((cast: any) => ({
      hash: cast.hash,
      text: cast.text || '',
      timestamp: cast.timestamp,
      likes: cast.reactions?.likes_count || 0,
      recasts: cast.reactions?.recasts_count || 0,
      replies: cast.replies?.count || 0,
    }));

    const creatorDetail: CreatorDetail = {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp_url || `https://avatar.vercel.sh/${user.username}`,
      bio: user.profile?.bio?.text || '',
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      power_badge: user.power_badge || false,
      score: calculateScoreFromCasts(castsResponse.casts || []),
      recent_casts: recentCasts,
    };

    return NextResponse.json({ creator: creatorDetail });
    
  } catch (error) {
    console.error('Neynar API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator details' }, 
      { status: 500 }
    );
  }
}
