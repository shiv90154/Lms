import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Search current affairs
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type');
        const category = searchParams.get('category');

        if (!query) {
            return NextResponse.json(
                { success: false, message: 'Search query is required' },
                { status: 400 }
            );
        }

        // Check authentication for premium content search
        const authResult = await verifyAuth(request);
        const isAuthenticated = authResult.isValid;

        const searchQuery = {
            isActive: true,
            publishedAt: { $exists: true }
        };

        // Build search regex
        const searchRegex = new RegExp(query, 'i');
        searchQuery.$or = [
            { title: searchRegex },
            { summary: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } }
        ];

        // Apply additional filters
        if (type) {
            searchQuery.type = type;
            // Monthly content requires authentication
            if (type === 'monthly' && !isAuthenticated) {
                return NextResponse.json(
                    { success: false, message: 'Authentication required for monthly content search' },
                    { status: 401 }
                );
            }
        }

        if (category) {
            searchQuery.category = category;
        }

        // If not authenticated, exclude premium content
        if (!isAuthenticated) {
            searchQuery.isPremium = false;
        }

        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            CurrentAffair.find(searchQuery)
                .select('title slug summary category date type isPremium viewCount tags')
                .sort({ date: -1, viewCount: -1 })
                .skip(skip)
                .limit(limit),
            CurrentAffair.countDocuments(searchQuery)
        ]);

        return NextResponse.json({
            success: true,
            data: results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            query: {
                searchTerm: query,
                type,
                category
            }
        });
    } catch (error) {
        console.error('Error searching current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to search current affairs', error: error.message },
            { status: 500 }
        );
    }
}
