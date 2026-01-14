import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { sendEnrollmentConfirmationEmail, sendEnrollmentNotificationToAdmin } from '@/lib/email';

/**
 * POST /api/enrollment
 * Create a new enrollment submission
 */
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Check if enrollment already exists with same email or phone
        const existingEnrollment = await Enrollment.findOne({
            $or: [
                { email: body.email.toLowerCase() },
                { phone: body.phone }
            ]
        });

        if (existingEnrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'An enrollment with this email or phone number already exists',
                    enrollmentId: existingEnrollment._id
                },
                { status: 409 }
            );
        }

        // Create new enrollment
        const enrollment = new Enrollment({
            fullName: body.fullName,
            email: body.email,
            phone: body.phone,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            parentDetails: body.parentDetails || {},
            address: body.address,
            education: body.education || {},
            interestedCourses: body.interestedCourses || [],
            targetExam: body.targetExam,
            preferredBatch: body.preferredBatch,
            documents: body.documents || [],
            leadSource: body.leadSource || 'website',
            referredBy: body.referredBy,
            remarks: body.remarks
        });

        await enrollment.save();

        // Send confirmation email to student
        await sendEnrollmentConfirmationEmail(enrollment.email, enrollment.fullName, enrollment._id);

        // Send notification to admin
        await sendEnrollmentNotificationToAdmin(enrollment);

        return NextResponse.json(
            {
                success: true,
                message: 'Enrollment submitted successfully',
                enrollmentId: enrollment._id,
                data: enrollment
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Enrollment submission error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to submit enrollment',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/enrollment
 * Get all enrollments (admin only)
 */
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }

        // Get enrollments with pagination
        const enrollments = await Enrollment.find(query)
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count
        const total = await Enrollment.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: enrollments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get enrollments error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch enrollments',
                error: error.message
            },
            { status: 500 }
        );
    }
}
