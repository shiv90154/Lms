import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch single current affair by ID (admin only)
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const currentAffair = await CurrentAffair.findById(params.id)
            .populate('author', 'firstName lastName email');

        if (!currentAffair) {
            return NextResponse.json(
                { success: false, message: 'Current affair not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: currentAffair
        });
    } catch (error) {
        console.error('Error fetching current affair:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch current affair', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update current affair (admin only)
export async function PUT(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            title,
            content,
            summary,
            category,
            date,
            type,
            isPremium,
            tags,
            imageUrl,
            seoTitle,
            seoDescription,
            isActive,
            scheduledFor
        } = body;

        const currentAffair = await CurrentAffair.findById(params.id);

        if (!currentAffair) {
            return NextResponse.json(
                { success: false, message: 'Current affair not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (title !== undefined) currentAffair.title = title;
        if (content !== undefined) currentAffair.content = content;
        if (summary !== undefined) currentAffair.summary = summary;
        if (category !== undefined) currentAffair.category = category;
        if (date !== undefined) currentAffair.date = new Date(date);
        if (type !== undefined) currentAffair.type = type;
        if (isPremium !== undefined) currentAffair.isPremium = isPremium;
        if (tags !== undefined) currentAffair.tags = tags;
        if (imageUrl !== undefined) currentAffair.imageUrl = imageUrl;
        if (seoTitle !== undefined) currentAffair.seoTitle = seoTitle;
        if (seoDescription !== undefined) currentAffair.seoDescription = seoDescription;
        if (isActive !== undefined) currentAffair.isActive = isActive;
        if (scheduledFor !== undefined) {
            currentAffair.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
        }

        // Ensure monthly content is premium
        if (currentAffair.type === 'monthly') {
            currentAffair.isPremium = true;
        }

        await currentAffair.save();

        return NextResponse.json({
            success: true,
            message: 'Current affair updated successfully',
            data: currentAffair
        });
    } catch (error) {
        console.error('Error updating current affair:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update current affair', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete current affair (admin only)
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const currentAffair = await CurrentAffair.findByIdAndDelete(params.id);

        if (!currentAffair) {
            return NextResponse.json(
                { success: false, message: 'Current affair not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Current affair deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting current affair:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete current affair', error: error.message },
            { status: 500 }
        );
    }
}
