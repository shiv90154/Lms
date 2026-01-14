import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Fetch trending current affairs (most viewed in last 7 days)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const days = parseInt(searchParams.get('days')) || 7;

        // Get trending content
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const trendingContent = await CurrentAffair.find({
            date: { $gte: daysAgo },
            isActive: true,
            publishedAt: { $exists: true },
            isPremium: false // Only show free content in trending
        })
            .select('title slug summary category date viewCount type')
            .sort({ viewCount: -1 })
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: trendingContent,
            meta: {
                days,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching trending content:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch trending content', error: error.message },
            { status: 500 }
        );
    }
}
