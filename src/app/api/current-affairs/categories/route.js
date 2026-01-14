import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Fetch all categories with content counts
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const query = {
            isActive: true,
            publishedAt: { $exists: true }
        };

        if (type) query.type = type;

        // Get category statistics
        const categories = await CurrentAffair.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    latestDate: { $max: '$date' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Format the response
        const formattedCategories = categories.map(cat => ({
            category: cat._id,
            count: cat.count,
            latestDate: cat.latestDate
        }));

        return NextResponse.json({
            success: true,
            data: formattedCategories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: error.message },
            { status: 500 }
        );
    }
}
