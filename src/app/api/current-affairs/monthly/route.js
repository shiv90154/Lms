import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch monthly current affairs (premium access required)
export async function GET(request) {
    try {
        // Check authentication for premium monthly content
        const authResult = await verifyAuth(request);
        if (!authResult.isValid) {
            return NextResponse.json(
                { success: false, message: 'Authentication required for monthly premium content' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        const query = {
            type: 'monthly',
            isPremium: true,
            isActive: true,
            publishedAt: { $exists: true }
        };

        if (category) query.category = category;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const skip = (page - 1) * limit;

        const [currentAffairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .select('-content') // Don't send full content in list view
                .sort({ year: -1, month: -1, date: -1 })
                .skip(skip)
                .limit(limit),
            CurrentAffair.countDocuments(query)
        ]);

        // In a real application, verify user's subscription/payment status here
        // TODO: Implement subscription/payment verification

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
        console.error('Error fetching monthly current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch monthly current affairs', error: error.message },
            { status: 500 }
        );
    }
}
