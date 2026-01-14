import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import CourseProgress from '@/models/CourseProgress';
import Course from '@/models/Course';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET /api/certificates - Get user's certificates
export async function GET(request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        const certificates = await Certificate.findByUser(userId);

        return NextResponse.json({
            success: true,
            data: certificates
        });

    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/certificates - Generate certificate for completed course
export async function POST(request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        const { courseId } = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Check if course exists
        const course = await Course.findById(courseId).populate('instructor', 'firstName lastName');
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Check if user completed the course
        const progress = await CourseProgress.getUserCourseProgress(userId, courseId);
        if (!progress || progress.progressPercentage !== 100) {
            return NextResponse.json(
                { error: 'Course not completed' },
                { status: 400 }
            );
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({ userId, courseId });
        if (existingCertificate) {
            return NextResponse.json(
                { error: 'Certificate already exists for this course' },
                { status: 400 }
            );
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Create certificate
        const certificate = new Certificate({
            userId,
            courseId,
            studentName: user.fullName,
            courseName: course.title,
            completionDate: progress.completedAt || new Date(),
            instructor: {
                name: course.instructor ? course.instructor.fullName : 'LMS Instructor',
                signature: null // Can be added later
            },
            metadata: {
                totalLessons: course.totalLessons,
                totalDuration: course.totalDuration,
                timeSpent: progress.timeSpent,
                progressPercentage: progress.progressPercentage
            }
        });

        await certificate.save();

        // Update progress to mark certificate as issued
        await progress.issueCertificate();

        return NextResponse.json({
            success: true,
            data: certificate,
            message: 'Certificate generated successfully'
        });

    } catch (error) {
        console.error('Error generating certificate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}