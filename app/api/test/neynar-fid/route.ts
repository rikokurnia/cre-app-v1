import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// Test different Neynar endpoints to see which ones work on free tier
const neynarConfig = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
});
const neynarClient = new NeynarAPIClient(neynarConfig);

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};

  // Test 1: fetchBulkUsers - Get user profile
  try {
    const users = await neynarClient.fetchBulkUsers({ fids: [616] }); // Vitalik
    results.fetchBulkUsers = {
      status: 'SUCCESS',
      data: users.users?.[0]?.username || 'got data',
    };
  } catch (e: any) {
    results.fetchBulkUsers = {
      status: 'FAILED',
      error: e.response?.status || e.message,
    };
  }

  // Test 2: fetchAllCastsCreatedByUser - Get user's casts
  try {
    const casts = await neynarClient.fetchAllCastsCreatedByUser({
      fid: 616,
      limit: 5,
    });
    results.fetchAllCastsCreatedByUser = {
      status: 'SUCCESS',
      count: casts.casts?.length || 0,
      sample: casts.casts?.[0]?.text?.slice(0, 50) || 'no text',
    };
  } catch (e: any) {
    results.fetchAllCastsCreatedByUser = {
      status: 'FAILED',
      error: e.response?.status || e.message,
    };
  }

  // Test 3: fetchCastsForUser (alternative method)
  try {
    const casts = await neynarClient.fetchCastsForUser({
      fid: 616,
      limit: 5,
    });
    results.fetchCastsForUser = {
      status: 'SUCCESS',
      count: casts.casts?.length || 0,
    };
  } catch (e: any) {
    results.fetchCastsForUser = {
      status: 'FAILED',
      error: e.response?.status || e.message,
    };
  }

  // Test 4: fetchFeed with FID filter (not global)
  try {
    const feed = await neynarClient.fetchFeed({
      feedType: 'filter',
      filterType: 'fids' as any,
      fids: [616],
      limit: 5,
    });
    results.fetchFeedByFid = {
      status: 'SUCCESS',
      count: feed.casts?.length || 0,
    };
  } catch (e: any) {
    results.fetchFeedByFid = {
      status: 'FAILED',
      error: e.response?.status || e.message,
    };
  }

  return NextResponse.json({
    testTime: new Date().toISOString(),
    targetFid: 616,
    targetUser: '@v (Vitalik)',
    results,
  });
}
