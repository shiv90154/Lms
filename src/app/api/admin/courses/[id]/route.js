import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseProgress from '@/models/CourseProgress';
import Enrollment from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// GET /api/admin/courses/[id] - Get specific course
export async function GET(request, { params }) {
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

        const { id } = params;

        const course = await Course.findById(id)
            .populate('instructor', 'firstName lastName email');

        if (!course) {
            return NextResponse.json(
                ApiResponse.error('Course not found', 404),
                { status: 404 }
            );
        }

        // Get enrollment statistics
        const enrollmentStats = await Enrollment.aggregate([
            { $match: { courseId: course._id } },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get progress statistics
        const progressStats = await CourseProgress.aggregate([
            { $match: { courseId: course._id } },
            {
                $group: {
                    _id: null,
                    averageProgress: { $avg: '$progressPercentage' },
                    completedCount: {
                        $sum: {
                            $cond: [{ $eq: ['$progressPercentage', 100] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const stats = {
            enrollments: enrollmentStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            averageProgress: progressStats[0]?.averageProgress || 0,
            completedStudents: progressStats[0]?.completedCount || 0
        };

        return NextResponse.json(
            ApiResponse.success('Course retrieved successfully', {
                course,
                stats
            })
        );

    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to fetch course', 500),
            { status: 500 }
        );
    }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(request, { params }) {
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

        const { id } = params;
        const body = await request.json();

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json(
                ApiResponse.error('Course not found', 404),
                { status: 404 }
            );
        }

        // Update course fields
        const allowedUpdates = [
            'title', 'description', 'price', 'category', 'thumbnail',
            'level', 'tags', 'modules', 'isActive'
        ];

        allowedUpdates.forEach(field => {
            if (body[field] !== undefined) {
                if (field === 'price') {
                    course[field] = parseFloat(body[field]);
                } else {
                    course[field] = body[field];
                }
            }
        });

        await course.save();

        // Populate instructor details for response
        await course.populate('instructor', 'firstName lastName email');

        return NextResponse.json(
            ApiResponse.success('Course updated successfully', course)
        );

    } catch (error) {
        console.error('Error updating course:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                ApiResponse.error('Course with this title already exists', 400),
                { status: 400 }
            );
        }

        return NextResponse.json(
            ApiResponse.error('Failed to update course', 500),
            { status: 500 }
        );
    }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(request, { params }) {
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

        const { id } = params;

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json(
                ApiResponse.error('Course not found', 404),
                { status: 404 }
            );
        }

        // Check if course has active enrollments
        const activeEnrollments = await Enrollment.countDocuments({
            courseId: id,
            paymentStatus: 'completed',
            isActive: true
        });

        if (activeEnrollments > 0) {
            return NextResponse.json(
                ApiResponse.error('Cannot delete course with active enrollments. Deactivate instead.', 400),
                { status: 400 }
            );
        }

        // Soft delete by setting isActive to false
        course.isActive = false;
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Course deactivated successfully')
        );

    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to delete course', 500),
            { status: 500 }
        );
    }
}