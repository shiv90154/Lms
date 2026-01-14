import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// POST /api/admin/courses/[id]/modules/[moduleId]/chapters/[chapterId]/lessons - Add lesson to chapter
export async function POST(request, { params }) {
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

        const { id, moduleId, chapterId } = params;
        const body = await request.json();
        const { title, type, content, duration, order, isLocked, description } = body;

        if (!title || !type || !content || !order) {
            return NextResponse.json(
                ApiResponse.error('Title, type, content, and order are required', 400),
                { status: 400 }
            );
        }

        if (!['video', 'pdf', 'text'].includes(type)) {
            return NextResponse.json(
                ApiResponse.error('Invalid lesson type. Must be video, pdf, or text', 400),
                { status: 400 }
            );
        }

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json(
                ApiResponse.error('Course not found', 404),
                { status: 404 }
            );
        }

        const module = course.getModuleById(moduleId);
        if (!module) {
            return NextResponse.json(
                ApiResponse.error('Module not found', 404),
                { status: 404 }
            );
        }

        const chapter = module.chapters.id(chapterId);
        if (!chapter) {
            return NextResponse.json(
                ApiResponse.error('Chapter not found', 404),
                { status: 404 }
            );
        }

        // Add new lesson
        const newLesson = {
            title,
            type,
            content,
            duration: duration ? parseInt(duration) : undefined,
            order: parseInt(order),
            isLocked: isLocked || false,
            description: description || ''
        };

        chapter.lessons.push(newLesson);
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Lesson added successfully', {
                lesson: chapter.lessons[chapter.lessons.length - 1]
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding lesson:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to add lesson', 500),
            { status: 500 }
        );
    }
}