import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { verifyAuth } from '@/middleware/auth';

// GET /api/admin/blogs - Get all blogs (admin only)
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const query = {};

        if (status) {
            query.status = status;
        }

        if (category) {
            query.categories = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'firstName lastName email')
                .sort({ createdAt: -1 })
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
            { success: false, message: 'Failed to fetch blogs', error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/admin/blogs - Create new blog post (admin only)
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            title,
            slug,
            content,
            excerpt,
            featuredImage,
            categories,
            tags,
            status,
            seoTitle,
            seoDescription,
            seoKeywords,
            relatedPosts
        } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { success: false, message: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        if (slug) {
            const existingBlog = await Blog.findOne({ slug });
            if (existingBlog) {
                return NextResponse.json(
                    { success: false, message: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        const blog = await Blog.create({
            title,
            slug,
            content,
            excerpt,
            author: authResult.user.userId,
            featuredImage,
            categories: categories || [],
            tags: tags || [],
            status: status || 'draft',
            seoTitle,
            seoDescription,
            seoKeywords: seoKeywords || [],
            relatedPosts: relatedPosts || []
        });

        const populatedBlog = await Blog.findById(blog._id)
            .populate('author', 'firstName lastName email');

        return NextResponse.json({
            success: true,
            message: 'Blog post created successfully',
            data: populatedBlog
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create blog post', error: error.message },
            { status: 500 }
        );
    }
}
