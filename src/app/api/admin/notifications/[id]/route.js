import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const notification = await Notification.findById(params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('specificUsers', 'firstName lastName email');

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { notification }
        });
    } catch (error) {
        console.error('Get notification error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notification' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const { title, message, type, isActive, priority, expiresAt } = body;

        const notification = await Notification.findById(params.id);
        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (title !== undefined) notification.title = title;
        if (message !== undefined) notification.message = message;
        if (type !== undefined) notification.type = type;
        if (isActive !== undefined) notification.isActive = isActive;
        if (priority !== undefined) notification.priority = priority;
        if (expiresAt !== undefined) notification.expiresAt = expiresAt;

        await notification.save();

        return NextResponse.json({
            success: true,
            data: { notification },
            message: 'Notification updated successfully'
        });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const notification = await Notification.findByIdAndDelete(params.id);
        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
