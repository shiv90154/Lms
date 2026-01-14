import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { verifyAuth } from '@/middleware/auth';

// GET /api/admin/blogs/[id] - Get single blog post (admin only)
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;

        const blog = await Blog.findById(id)
            .populate('author', 'firstName lastName email')
            .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt');

        if (!blog) {
            return NextResponse.json(
                { success: false, message: 'Blog post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch blog post', error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/admin/blogs/[id] - Update blog post (admin only)
export async function PUT(request, { params }) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;
        const body = await request.json();

        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Check if slug is being changed and if it already exists
        if (body.slug && body.slug !== blog.slug) {
            const existingBlog = await Blog.findOne({ slug: body.slug });
            if (existingBlog) {
                return NextResponse.json(
                    { success: false, message: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        // Update fields
        const allowedFields = [
            'title',
            'slug',
            'content',
            'excerpt',
            'featuredImage',
            'categories',
            'tags',
            'status',
            'seoTitle',
            'seoDescription',
            'seoKeywords',
            'relatedPosts'
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                blog[field] = body[field];
            }
        });

        await blog.save();

        const updatedBlog = await Blog.findById(id)
            .populate('author', 'firstName lastName email')
            .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt');

        return NextResponse.json({
            success: true,
            message: 'Blog post updated successfully',
            data: updatedBlog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update blog post', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/blogs/[id] - Delete blog post (admin only)
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, message: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: 'Blog post not found' },
                { status: 404 }
            );
        }

        await Blog.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete blog post', error: error.message },
            { status: 500 }
        );
    }
}
