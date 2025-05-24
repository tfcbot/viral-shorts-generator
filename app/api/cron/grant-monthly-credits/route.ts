import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from a cron job (basic security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we should grant credits (only on the 1st of the month)
    const now = new Date();
    const isFirstOfMonth = now.getDate() === 1;
    
    if (!isFirstOfMonth) {
      return NextResponse.json({ 
        message: 'Not the 1st of the month, skipping credit grant',
        date: now.toISOString()
      });
    }

    // Grant monthly credits to all active subscribers
    const result = await convex.mutation(api.billing.grantMonthlyCredits, {});

    return NextResponse.json({
      success: true,
      message: result.message,
      grantedToUsers: result.grantedToUsers,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error granting monthly credits:', error);
    return NextResponse.json(
      { error: 'Failed to grant monthly credits' },
      { status: 500 }
    );
  }
}

// Allow GET for testing/status checks
export async function GET() {
  const now = new Date();
  return NextResponse.json({
    message: 'Monthly credit grant endpoint',
    currentDate: now.toISOString(),
    isFirstOfMonth: now.getDate() === 1,
    nextGrant: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  });
} 