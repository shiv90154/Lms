import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Fetch daily current affairs (free access)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const category = searchParams.get('category');
        const date = searchParams.get('date');

        const query = {
            type: 'daily',
            isPremium: false,
            isActive: true,
            publishedAt: { $exists: true }
        };

        if (category) query.category = category;

        if (date) {
            // Filter by specific date
            const targetDate = new Date(date);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            query.date = {
                $gte: targetDate,
                $lt: nextDay
            };
        }

        const skip = (page - 1) * limit;

        const [currentAffairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .select('-content') // Don't send full content in list view
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            CurrentAffair.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: currentAffairs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching daily current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch daily current affairs', error: error.message },
            { status: 500 }
        );
    }
}
