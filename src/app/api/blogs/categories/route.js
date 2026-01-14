import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs/categories - Get all categories with published blog counts
export async function GET(request) {
    try {
        await connectDB();

        // Get all unique categories from published blogs
        const categories = await Blog.distinct('categories', { status: 'published' });

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
