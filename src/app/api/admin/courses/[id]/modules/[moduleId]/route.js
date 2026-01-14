import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

// PUT /api/admin/courses/[id]/modules/[moduleId] - Update specific module
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

        const { id, moduleId } = params;
        const body = await request.json();
        const { title, description, order } = body;

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

        // Update module fields
        if (title) module.title = title;
        if (description !== undefined) module.description = description;
        if (order) module.order = parseInt(order);

        await course.save();

        return NextResponse.json(
            ApiResponse.success('Module updated successfully', module)
        );

    } catch (error) {
        console.error('Error updating module:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to update module', 500),
            { status: 500 }
        );
    }
}

// DELETE /api/admin/courses/[id]/modules/[moduleId] - Delete module
export async function DELETE(request, { params }) {
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

        // Remove module
        course.modules.pull(moduleId);
        await course.save();

        return NextResponse.json(
            ApiResponse.success('Module deleted successfully')
        );

    } catch (error) {
        console.error('Error deleting module:', error);
        return NextResponse.json(
            ApiResponse.error('Failed to delete module', 500),
            { status: 500 }
        );
    }
}