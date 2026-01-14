import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Get notifications for the user
        const notifications = await Notification.getUserNotifications(
            authResult.user.userId,
            authResult.user.role
        );

        // Filter unread if requested
        let filteredNotifications = notifications;
        if (unreadOnly) {
            filteredNotifications = notifications.filter(
                notif => !notif.isReadBy(authResult.user.userId)
            );
        }

        // Add isRead flag to each notification
        const notificationsWithReadStatus = filteredNotifications.map(notif => ({
            ...notif.toJSON(),
            isRead: notif.isReadBy(authResult.user.userId)
        }));

        // Count unread notifications
        const unreadCount = notifications.filter(
            notif => !notif.isReadBy(authResult.user.userId)
        ).length;

        return NextResponse.json({
            success: true,
            data: {
                notifications: notificationsWithReadStatus,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Get user notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
