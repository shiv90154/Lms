import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// GET /api/admin/courses - Get all courses with pagination
export async function GET(request) {
    try {
        await connectDB();

        // Verify admin token
        const authResult = await verifyToken(request);
        if (!authResult.success || authResult.user.role !== 'admin') {
            return NextResponse.json(
                ApiResponse.error('Unauthorized access', 401),
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const search = searchParams.get('search');
        const status = searchParams.get('status'); // active, inactive, all

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (level) filter.level = level;
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get courses with pagination
        const courses = await Course.find(filter)
            .populate('instructor', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalCourses = await Course.countDocuments(filter);
        const totalPages = Math.ceil(totalCourses / limit);

        return NextResponse.json(
            ApiResponse.success('Courses retrieved successfully', {
                courses,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCourses,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            })
        );

    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to fetch courses', 500),
            { status: 500 }
        );
    }
}

// POST /api/admin/courses - Create new course
export async function POST(request) {
    try {
        await connectDB();

        // Verify admin token
        const authResult = await verifyToken(request);
        if (!authResult.success || authResult.user.role !== 'admin') {
            return NextResponse.json(
                ApiResponse.error('Unauthorized access', 401),
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            price,
            category,
            thumbnail,
            level,
            tags,
            modules
        } = body;

        // Validate required fields
        if (!title || !description || !price || !category || !thumbnail || !level) {
            return NextResponse.json(
                ApiResponse.error('Missing required fields', 400),
                { status: 400 }
            );
        }

        // Create new course
        const course = new Course({
            title,
            description,
            price: parseFloat(price),
            category,
            thumbnail,
            level,
            tags: tags || [],
            modules: modules || [],
            instructor: authResult.user.userId
        });

        await course.save();

        // Populate instructor details for response
        await course.populate('instructor', 'firstName lastName email');

        return NextResponse.json(
            ApiResponse.success('Course created successfully', course),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating course:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                ApiResponse.error('Course with this title already exists', 400),
                { status: 400 }
            );
        }

        return NextResponse.json(
            ApiResponse.error('Failed to create course', 500),
            { status: 500 }
        );
    }
}