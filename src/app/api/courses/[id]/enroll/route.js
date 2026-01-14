import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// POST /api/courses/[id]/enroll - Enroll user in course
export async function POST(request, { params }) {
    try {
        await connectDB();

        // Verify user token
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json(
                ApiResponse.error('Unauthorized access', 401),
                { status: 401 }
            );
        }

        const { id: courseId } = params;
        const body = await request.json();
        const { paymentId, orderId } = body;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course || !course.isActive) {
            return NextResponse.json(
                ApiResponse.error('Course not found or inactive', 404),
                { status: 404 }
            );
        }

        // Check if user is already enrolled
        const existingEnrollment = await Enrollment.findOne({
            userId: authResult.user.userId,
            courseId,
            paymentStatus: 'completed'
        });

        if (existingEnrollment) {
            return NextResponse.json(
                ApiResponse.error('User already enrolled in this course', 400),
                { status: 400 }
            );
        }

        // Create enrollment
        const enrollment = await Enrollment.createEnrollment(
            authResult.user.userId,
            courseId,
            course.price,
            paymentId,
            orderId
        );

        // If payment is provided, complete the enrollment
        if (paymentId) {
            await enrollment.completePayment(paymentId);
        }

        return NextResponse.json(
            ApiResponse.success('Enrollment created successfully', {
                enrollmentId: enrollment._id,
                courseId,
                paymentStatus: enrollment.paymentStatus,
                enrollmentDate: enrollment.enrollmentDate
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating enrollment:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                ApiResponse.error('User already enrolled in this course', 400),
                { status: 400 }
            );
        }

        return NextResponse.json(
            ApiResponse.error('Failed to create enrollment', 500),
            { status: 500 }
        );
    }
}

// GET /api/courses/[id]/enroll - Check enrollment status
export async function GET(request, { params }) {
    try {
        await connectDB();

        // Verify user token
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json(
                ApiResponse.error('Unauthorized access', 401),
                { status: 401 }
            );
        }

        const { id: courseId } = params;

        // Check enrollment status
        const enrollment = await Enrollment.findOne({
            userId: authResult.user.userId,
            courseId
        });

        const isEnrolled = enrollment && enrollment.isValid();

        return NextResponse.json(
            ApiResponse.success('Enrollment status retrieved', {
                isEnrolled,
                enrollment: enrollment ? {
                    id: enrollment._id,
                    paymentStatus: enrollment.paymentStatus,
                    enrollmentDate: enrollment.enrollmentDate,
                    isActive: enrollment.isActive
                } : null
            })
        );

    } catch (error) {
        console.error('Error checking enrollment status:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to check enrollment status', 500),
            { status: 500 }
        );
    }
}