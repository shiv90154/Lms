import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import CourseProgress from '@/models/CourseProgress';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// GET /api/courses/[id]/access - Check course access and get course content
export async function GET(request, { params }) {
    try {
        await connectDB();

        // Verify user token (optional for public course info)
        const authResult = await verifyToken(request);
        const userId = authResult.success ? authResult.user.userId : null;

        const { id: courseId } = params;

        // Get course details
        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email');

        if (!course) {
            return NextResponse.json(
                ApiResponse.error('Course not found', 404),
                { status: 404 }
            );
        }

        let hasAccess = false;
        let enrollment = null;
        let progress = null;

        // Check enrollment and access if user is authenticated
        if (userId) {
            enrollment = await Enrollment.findOne({
                userId,
                courseId,
                paymentStatus: 'completed',
                isActive: true
            });

            hasAccess = !!enrollment;

            // Get progress if enrolled
            if (hasAccess) {
                progress = await CourseProgress.findOne({
                    userId,
                    courseId
                });
            }
        }

        // Prepare course data based on access level
        const courseData = {
            _id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            category: course.category,
            thumbnail: course.thumbnail,
            level: course.level,
            tags: course.tags,
            instructor: course.instructor,
            enrollmentCount: course.enrollmentCount,
            rating: course.rating,
            totalDuration: course.totalDuration,
            totalLessons: course.totalLessons,
            totalChapters: course.totalChapters,
            createdAt: course.createdAt
        };

        // Add modules/content only if user has access
        if (hasAccess) {
            courseData.modules = course.modules;
        } else {
            // Provide limited preview - first lesson of first chapter of first module
            courseData.modules = course.modules.map(module => ({
                _id: module._id,
                title: module.title,
                description: module.description,
                order: module.order,
                chapters: module.chapters.slice(0, 1).map(chapter => ({
                    _id: chapter._id,
                    title: chapter.title,
                    description: chapter.description,
                    order: chapter.order,
                    lessons: chapter.lessons.slice(0, 1).map(lesson => ({
                        _id: lesson._id,
                        title: lesson.title,
                        type: lesson.type,
                        duration: lesson.duration,
                        order: lesson.order,
                        isLocked: true, // Always locked for non-enrolled users
                        description: lesson.description
                        // Don't include content for preview
                    }))
                }))
            }));
        }

        return NextResponse.json(
            ApiResponse.success('Course access information retrieved', {
                course: courseData,
                access: {
                    hasAccess,
                    isEnrolled: hasAccess,
                    enrollment: enrollment ? {
                        id: enrollment._id,
                        enrollmentDate: enrollment.enrollmentDate,
                        paymentStatus: enrollment.paymentStatus
                    } : null,
                    progress: progress ? {
                        progressPercentage: progress.progressPercentage,
                        completedLessons: progress.completedLessons.length,
                        timeSpent: progress.timeSpent,
                        lastAccessedAt: progress.lastAccessedAt,
                        certificateIssued: progress.certificateIssued
                    } : null
                }
            })
        );

    } catch (error) {
        console.error('Error checking course access:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to check course access', 500),
            { status: 500 }
        );
    }
}