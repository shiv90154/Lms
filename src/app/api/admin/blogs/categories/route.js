import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { verifyAuth } from '@/middleware/auth';

// GET /api/admin/blogs/categories - Get all unique categories
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        // Get all unique categories from blogs
        const categories = await Blog.distinct('categories');

        // Get count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Blog.countDocuments({
                    categories: category,
                    status: 'published'
                });
                return { name: category, count };
            })
        );

        return NextResponse.json({
            success: true,
            data: categoriesWithCount.sort((a, b) => b.count - a.count)
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: error.message },
            { status: 500 }
        );
    }
}
