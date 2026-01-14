import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyAuth } from '@/middleware/auth';
import { sendEmail } from '@/lib/email';

export async function GET(request) {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type') || '';
        const recipients = searchParams.get('recipients') || '';

        // Build query
        const query = {};
        if (type) query.type = type;
        if (recipients) query.recipients = recipients;

        // Get total count
        const totalCount = await Notification.countDocuments(query);

        // Get notifications with pagination
        const notifications = await Notification.find(query)
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNextPage: page < Math.ceil(totalCount / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
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
        const {
            title,
            message,
            type,
            recipients,
            specificUsers,
            sendEmail: shouldSendEmail,
            priority,
            expiresAt
        } = body;

        // Validate required fields
        if (!title || !message) {
            return NextResponse.json(
                { error: 'Title and message are required' },
                { status: 400 }
            );
        }

        // Create notification
        const notification = new Notification({
            title,
            message,
            type: type || 'info',
            recipients: recipients || 'all',
            specificUsers: specificUsers || [],
            createdBy: authResult.user.userId,
            sendEmail: shouldSendEmail || false,
            priority: priority || 'medium',
            expiresAt: expiresAt || null
        });

        await notification.save();

        // Send emails if requested
        if (shouldSendEmail) {
            try {
                let recipientUsers = [];

                if (recipients === 'all') {
                    recipientUsers = await User.find({ isActive: true }).select('email firstName lastName');
                } else if (recipients === 'students') {
                    recipientUsers = await User.find({ role: 'student', isActive: true }).select('email firstName lastName');
                } else if (recipients === 'admins') {
                    recipientUsers = await User.find({ role: 'admin', isActive: true }).select('email firstName lastName');
                } else if (recipients === 'specific' && specificUsers && specificUsers.length > 0) {
                    recipientUsers = await User.find({ _id: { $in: specificUsers }, isActive: true }).select('email firstName lastName');
                }

                // Send emails to all recipients
                const emailPromises = recipientUsers.map(user =>
                    sendEmail({
                        to: user.email,
                        subject: title,
                        html: `
                            <h2>${title}</h2>
                            <p>Hello ${user.firstName},</p>
                            <p>${message}</p>
                            <br>
                            <p>Best regards,<br>Admin Team</p>
                        `
                    }).catch(err => {
                        console.error(`Failed to send email to ${user.email}:`, err);
                        return null;
                    })
                );

                await Promise.all(emailPromises);

                notification.emailSent = true;
                notification.emailSentAt = new Date();
                await notification.save();
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Don't fail the notification creation if email fails
            }
        }

        return NextResponse.json({
            success: true,
            data: { notification },
            message: 'Notification created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Create notification error:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}
