import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// POST /api/admin/courses/[id]/modules - Add module to course
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

        const { id } = params;
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

        // Add new module
        const newModule = {
            title,
            description: description || '',
            order: parseInt(order),
            chapters: []
        };

        course.modules.push(newModule);
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Module added successfully', {
                module: course.modules[course.modules.length - 1]
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding module:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to add module', 500),
            { status: 500 }
        );
    }
}

// PUT /api/admin/courses/[id]/modules - Update module order
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
        const { modules } = body;

        if (!modules || !Array.isArray(modules)) {
            return NextResponse.json(
                ApiResponse.error('Modules array is required', 400),
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

        // Update module order
        course.modules = modules;
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Module order updated successfully', course.modules)
        );

    } catch (error) {
        console.error('Error updating module order:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to update module order', 500),
            { status: 500 }
        );
    }
}