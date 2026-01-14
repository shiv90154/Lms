import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CourseProgress from '@/models/CourseProgress';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// POST /api/courses/[id]/lessons/[lessonId]/progress - Update lesson progress
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

        const { id: courseId, lessonId } = params;
        const body = await request.json();
        const { currentTime, timeSpent, isCompleted } = body;

        // Check if user is enrolled in the course
        const isEnrolled = await Enrollment.isUserEnrolled(authResult.user.userId, courseId);
        if (!isEnrolled) {
            return NextResponse.json(
                ApiResponse.error('User not enrolled in this course', 403),
                { status: 403 }
            );
        }

        // Get or create course progress
        let courseProgress = await CourseProgress.findOne({
            userId: authResult.user.userId,
            courseId
        });

        if (!courseProgress) {
            courseProgress = new CourseProgress({
                userId: authResult.user.userId,
                courseId
            });
        }

        // Update lesson progress
        if (isCompleted) {
            await courseProgress.markLessonCompleted(lessonId, timeSpent || 0);
        }

        // Update video progress for resume functionality
        if (currentTime !== undefined) {
            // Store current position for video lessons
            const existingProgress = courseProgress.completedLessons.find(
                lesson => lesson.lessonId.toString() === lessonId
            );

            if (existingProgress) {
                existingProgress.lastPosition = currentTime;
                existingProgress.timeSpent = Math.max(existingProgress.timeSpent, timeSpent || 0);
            } else {
                // Create progress entry even if not completed (for resume functionality)
                courseProgress.completedLessons.push({
                    lessonId,
                    lastPosition: currentTime,
                    timeSpent: timeSpent || 0,
                    completedAt: isCompleted ? new Date() : null
                });
            }
        }

        await courseProgress.save();

        // Check if course is now completed and issue certificate
        if (courseProgress.progressPercentage === 100 && !courseProgress.certificateIssued) {
            await courseProgress.issueCertificate();
        }

        return NextResponse.json(
            ApiResponse.success('Progress updated successfully', {
                progressPercentage: courseProgress.progressPercentage,
                isCompleted: courseProgress.progressPercentage === 100,
                certificateIssued: courseProgress.certificateIssued
            })
        );

    } catch (error) {
        console.error('Error updating lesson progress:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to update progress', 500),
            { status: 500 }
        );
    }
}

// GET /api/courses/[id]/lessons/[lessonId]/progress - Get lesson progress
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

        const { id: courseId, lessonId } = params;

        // Check if user is enrolled in the course
        const isEnrolled = await Enrollment.isUserEnrolled(authResult.user.userId, courseId);
        if (!isEnrolled) {
            return NextResponse.json(
                ApiResponse.error('User not enrolled in this course', 403),
                { status: 403 }
            );
        }

        // Get course progress
        const courseProgress = await CourseProgress.findOne({
            userId: authResult.user.userId,
            courseId
        });

        if (!courseProgress) {
            return NextResponse.json(
                ApiResponse.success('No progress found', {
                    isCompleted: false,
                    lastPosition: 0,
                    timeSpent: 0
                })
            );
        }

        // Find lesson progress
        const lessonProgress = courseProgress.completedLessons.find(
            lesson => lesson.lessonId.toString() === lessonId
        );

        const progressData = {
            isCompleted: lessonProgress ? !!lessonProgress.completedAt : false,
            lastPosition: lessonProgress ? lessonProgress.lastPosition || 0 : 0,
            timeSpent: lessonProgress ? lessonProgress.timeSpent || 0 : 0,
            completedAt: lessonProgress ? lessonProgress.completedAt : null
        };

        return NextResponse.json(
            ApiResponse.success('Progress retrieved successfully', progressData)
        );

    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to fetch progress', 500),
            { status: 500 }
        );
    }
}