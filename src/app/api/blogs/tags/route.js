import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs/tags - Get all tags with published blog counts
export async function GET(request) {
    try {
        await connectDB();

        // Get all unique tags from published blogs
        const tags = await Blog.distinct('tags', { status: 'published' });

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
