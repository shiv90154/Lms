import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';

/**
 * POST /api/enrollment/[id]/follow-up
 * Add a follow-up note to an enrollment (admin only)
 */
export async function POST(request, { params }) {
    try {
        await connectDB();

        const { id } = params;
        const body = await request.json();

        // Validate required fields
        if (!body.date || !body.notes) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Date and notes are required'
                },
                { status: 400 }
            );
        }

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

        // Add follow-up
        await enrollment.addFollowUp({
            date: body.date,
            notes: body.notes,
            contactedBy: body.contactedBy,
            nextFollowUpDate: body.nextFollowUpDate
        });

        // Update status to 'contacted' if not already
        if (enrollment.status === 'pending') {
            enrollment.status = 'contacted';
            await enrollment.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Follow-up added successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Add follow-up error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to add follow-up',
                error: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/enrollment/[id]/follow-up
 * Get all follow-ups for an enrollment
 */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        const enrollment = await Enrollment.findById(id)
            .populate('followUps.contactedBy', 'firstName lastName email')
            .lean();

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
            data: enrollment.followUps || []
        });
    } catch (error) {
        console.error('Get follow-ups error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch follow-ups',
                error: error.message
            },
            { status: 500 }
        );
    }
}
