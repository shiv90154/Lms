import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch current affairs (public with access control)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const search = searchParams.get('search');

        // Check authentication for premium content
        const authResult = await verifyAuth(request);
        const isAuthenticated = authResult.isValid;

        const query = { isActive: true, publishedAt: { $exists: true } };

        // Access control: Daily content is free, monthly is premium
        if (type === 'monthly' || searchParams.get('premium') === 'true') {
            // Premium content requires authentication
            if (!isAuthenticated) {
                return NextResponse.json(
                    { success: false, message: 'Authentication required for premium content' },
                    { status: 401 }
                );
            }
            query.isPremium = true;
        } else if (type === 'daily') {
            query.type = 'daily';
            query.isPremium = false;
        }

        if (category) query.category = category;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { summary: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
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
        console.error('Error fetching current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch current affairs', error: error.message },
            { status: 500 }
        );
    }
}
