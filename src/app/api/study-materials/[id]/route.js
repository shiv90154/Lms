import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import { verifyAuth } from '@/middleware/auth';

// GET /api/study-materials/[id] - Get single study material
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        const material = await StudyMaterial.findById(id)
            .populate('uploadedBy', 'firstName lastName email');

        if (!material || !material.isActive) {
            return NextResponse.json(
                { error: 'Study material not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: material
        });

    } catch (error) {
        console.error('Error fetching study material:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/study-materials/[id] - Update study material (Admin only)
export async function PUT(request, { params }) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;
        const body = await request.json();

        // Validate type if provided
        if (body.type && !['pdf', 'notes', 'previous_paper'].includes(body.type)) {
            return NextResponse.json(
                { error: 'Invalid material type' },
                { status: 400 }
            );
        }

        const material = await StudyMaterial.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('uploadedBy', 'firstName lastName email');

        if (!material) {
            return NextResponse.json(
                { error: 'Study material not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: material
        });

    } catch (error) {
        console.error('Error updating study material:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/study-materials/[id] - Delete study material (Admin only)
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;

        // Soft delete by setting isActive to false
        const material = await StudyMaterial.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!material) {
            return NextResponse.json(
                { error: 'Study material not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Study material deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting study material:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
