import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Filter current affairs by category, month, and year
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const type = searchParams.get('type');
        const sortBy = searchParams.get('sortBy') || 'date'; // date, views, title
        const order = searchParams.get('order') || 'desc'; // asc, desc

        // Check authentication for premium content
        const authResult = await verifyAuth(request);
        const isAuthenticated = authResult.isValid;

        const query = {
            isActive: true,
            publishedAt: { $exists: true }
        };

        // Apply filters
        if (category) query.category = category;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (type) {
            query.type = type;
            // Monthly content requires authentication
            if (type === 'monthly' && !isAuthenticated) {
                return NextResponse.json(
                    { success: false, message: 'Authentication required for monthly content' },
                    { status: 401 }
                );
            }
        }

        // If no type specified but filters suggest monthly content
        if (!type && month && year && !isAuthenticated) {
            // Allow access but filter out premium content
            query.isPremium = false;
        }

        const skip = (page - 1) * limit;

        // Build sort object
        const sortObj = {};
        if (sortBy === 'views') {
            sortObj.viewCount = order === 'asc' ? 1 : -1;
        } else if (sortBy === 'title') {
            sortObj.title = order === 'asc' ? 1 : -1;
        } else {
            sortObj.date = order === 'asc' ? 1 : -1;
        }

        const [currentAffairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .select('-content') // Don't send full content in list view
                .sort(sortObj)
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
            },
            filters: {
                category,
                month: month ? parseInt(month) : null,
                year: year ? parseInt(year) : null,
                type,
                sortBy,
                order
            }
        });
    } catch (error) {
        console.error('Error filtering current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to filter current affairs', error: error.message },
            { status: 500 }
        );
    }
}
