import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// POST - Publish scheduled content (admin only)
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find all scheduled content that should be published
        const scheduledContent = await CurrentAffair.findScheduledContent();

        if (scheduledContent.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No scheduled content to publish',
                data: { published: 0 }
            });
        }

        // Publish all scheduled content
        const publishPromises = scheduledContent.map(async (content) => {
            await content.publish();
            return content;
        });

        const publishedContent = await Promise.all(publishPromises);

        return NextResponse.json({
            success: true,
            message: `Successfully published ${publishedContent.length} content items`,
            data: {
                published: publishedContent.length,
                items: publishedContent
            }
        });
    } catch (error) {
        console.error('Error publishing scheduled content:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to publish scheduled content', error: error.message },
            { status: 500 }
        );
    }
}
