import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs/slug/[slug] - Get blog post by slug
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug } = params;

        const blog = await Blog.findBySlug(slug);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await blog.incrementViewCount();

        // Get related posts
        const relatedPosts = await blog.findRelatedPosts(3);

        return NextResponse.json({
            success: true,
            data: {
                blog,
                relatedPosts
            }
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch blog post', error: error.message },
            { status: 500 }
        );
    }
}
