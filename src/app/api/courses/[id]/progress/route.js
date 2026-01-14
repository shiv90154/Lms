import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET /api/courses/[id]/progress - Get user's progress for a specific course
export async function GET(request, { params }) {
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

        const courseId = params.id;
        const userId = decoded.userId;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Get or create progress record
        let progress = await CourseProgress.getUserCourseProgress(userId, courseId);

        if (!progress) {
            // Create new progress record if user is enrolled
            const user = await User.findById(userId);
            if (!user.enrolledCourses.includes(courseId)) {
                return NextResponse.json(
                    { error: 'User not enrolled in this course' },
                    { status: 403 }
                );
            }

            progress = new CourseProgress({
                userId,
                courseId,
                completedLessons: [],
                progressPercentage: 0,
                timeSpent: 0
            });
            await progress.save();
        }

        return NextResponse.json({
            success: true,
            data: progress
        });

    } catch (error) {
        console.error('Error fetching course progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/courses/[id]/progress - Update course progress (mark lesson complete, update current lesson)
export async function POST(request, { params }) {
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

        const courseId = params.id;
        const userId = decoded.userId;
        const body = await request.json();

        const { action, lessonId, moduleId, chapterId, timeSpent = 0 } = body;

        // Validate required fields
        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Get or create progress record
        let progress = await CourseProgress.getUserCourseProgress(userId, courseId);

        if (!progress) {
            progress = new CourseProgress({
                userId,
                courseId,
                completedLessons: [],
                progressPercentage: 0,
                timeSpent: 0
            });
        }

        switch (action) {
            case 'complete_lesson':
                if (!lessonId) {
                    return NextResponse.json(
                        { error: 'Lesson ID is required for complete_lesson action' },
                        { status: 400 }
                    );
                }

                // Verify lesson exists in course
                const lesson = course.getLessonById(lessonId);
                if (!lesson) {
                    return NextResponse.json(
                        { error: 'Lesson not found in course' },
                        { status: 404 }
                    );
                }

                await progress.markLessonCompleted(lessonId, timeSpent);
                break;

            case 'update_current_lesson':
                if (!lessonId || !moduleId || !chapterId) {
                    return NextResponse.json(
                        { error: 'Module ID, Chapter ID, and Lesson ID are required for update_current_lesson action' },
                        { status: 400 }
                    );
                }

                await progress.updateCurrentLesson(moduleId, chapterId, lessonId);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        // Reload progress to get updated data
        progress = await CourseProgress.getUserCourseProgress(userId, courseId);

        return NextResponse.json({
            success: true,
            data: progress,
            message: `Successfully ${action.replace('_', ' ')}`
        });

    } catch (error) {
        console.error('Error updating course progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}