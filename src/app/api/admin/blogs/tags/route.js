import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { verifyAuth } from '@/middleware/auth';

// GET /api/admin/blogs/tags - Get all unique tags
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

        // Get all unique tags from blogs
        const tags = await Blog.distinct('tags');

        // Get count for each tag
        const tagsWithCount = await Promise.all(
            tags.map(async (tag) => {
                const count = await Blog.countDocuments({
                    tags: tag,
                    status: 'published'
                });
                return { name: tag, count };
            })
        );

        return NextResponse.json({
            success: true,
            data: tagsWithCount.sort((a, b) => b.count - a.count)
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tags', error: error.message },
            { status: 500 }
        );
    }
}
