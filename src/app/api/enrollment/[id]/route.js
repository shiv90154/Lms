import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { sendEnrollmentStatusUpdateEmail } from '@/lib/email';

/**
 * GET /api/enrollment/[id]
 * Get a specific enrollment by ID
 */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        const enrollment = await Enrollment.findById(id).lean();

        if (!enrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Enrollment not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        console.error('Get enrollment error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch enrollment',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/enrollment/[id]
 * Update enrollment status and details (admin only)
 */
export async function PATCH(request, { params }) {
    try {
        await connectDB();

        const { id } = params;
        const body = await request.json();

        const enrollment = await Enrollment.findById(id);

        if (!enrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Enrollment not found'
                },
                { status: 404 }
            );
        }

        // Update status if provided
        if (body.status) {
            await enrollment.updateStatus(body.status, body.adminNotes);

            // Send status update email
            await sendEnrollmentStatusUpdateEmail(
                enrollment.email,
                enrollment.fullName,
                body.status
            );
        }

        // Update other fields if provided
        if (body.remarks) enrollment.remarks = body.remarks;
        if (body.adminNotes) enrollment.adminNotes = body.adminNotes;
        if (body.userId) enrollment.userId = body.userId;

        await enrollment.save();

        return NextResponse.json({
            success: true,
            message: 'Enrollment updated successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Update enrollment error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update enrollment',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/enrollment/[id]
 * Delete an enrollment (admin only)
 */
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        const enrollment = await Enrollment.findByIdAndDelete(id);

        if (!enrollment) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Enrollment not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Enrollment deleted successfully'
        });
    } catch (error) {
        console.error('Delete enrollment error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete enrollment',
                error: error.message
            },
            { status: 500 }
        );
    }
}
