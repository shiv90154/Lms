import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs - Get all published blog posts
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');

        const query = { status: 'published' };

        if (category) {
            query.categories = category;
        }

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'firstName lastName')
                .select('-content') // Exclude full content for list view
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch blog posts', error: error.message },
            { status: 500 }
        );
    }
}
