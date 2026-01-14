import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import { verifyToken } from '@/lib/auth';

// GET /api/courses/progress - Get all course progress for the authenticated user
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
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'completed', 'in-progress', 'all'

        let progressData;

        switch (status) {
            case 'completed':
                progressData = await CourseProgress.getCompletedCourses(userId);
                break;
            case 'in-progress':
                progressData = await CourseProgress.getInProgressCourses(userId);
                break;
            default:
                progressData = await CourseProgress.findByUser(userId);
                break;
        }

        return NextResponse.json({
            success: true,
            data: progressData
        });

    } catch (error) {
        console.error('Error fetching user progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}