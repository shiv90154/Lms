import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch analytics for current affairs (admin only)
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query = { isActive: true };
        if (type) query.type = type;

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get analytics data
        const [
            totalContent,
            totalViews,
            dailyContent,
            monthlyContent,
            topViewed,
            categoryStats,
            recentContent
        ] = await Promise.all([
            // Total content count
            CurrentAffair.countDocuments(query),

            // Total views
            CurrentAffair.aggregate([
                { $match: query },
                { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
            ]),

            // Daily content count
            CurrentAffair.countDocuments({ ...query, type: 'daily' }),

            // Monthly content count
            CurrentAffair.countDocuments({ ...query, type: 'monthly' }),

            // Top 10 most viewed
            CurrentAffair.find(query)
                .select('title slug viewCount date type category')
                .sort({ viewCount: -1 })
                .limit(10),

            // Category-wise statistics
            CurrentAffair.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalViews: { $sum: '$viewCount' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Recent content (last 7 days)
            CurrentAffair.countDocuments({
                ...query,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalContent,
                    totalViews: totalViews[0]?.totalViews || 0,
                    dailyContent,
                    monthlyContent,
                    recentContent
                },
                topViewed,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch analytics', error: error.message },
            { status: 500 }
        );
    }
}
