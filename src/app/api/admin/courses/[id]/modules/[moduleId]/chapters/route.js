import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// POST /api/admin/courses/[id]/modules/[moduleId]/chapters - Add chapter to module
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

        const { id, moduleId } = params;
        const body = await request.json();
        const { title, description, order } = body;

        if (!title || !order) {
            return NextResponse.json(
                ApiResponse.error('Title and order are required', 400),
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

        // Add new chapter
        const newChapter = {
            title,
            description: description || '',
            order: parseInt(order),
            lessons: []
        };

        module.chapters.push(newChapter);
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Chapter added successfully', {
                chapter: module.chapters[module.chapters.length - 1]
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding chapter:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to add chapter', 500),
            { status: 500 }
        );
    }
}