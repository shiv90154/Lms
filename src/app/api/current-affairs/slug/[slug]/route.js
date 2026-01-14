import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch current affair by slug with access control and view tracking
export async function GET(request, { params }) {
    try {
        await connectDB();

        const currentAffair = await CurrentAffair.findOne({
            slug: params.slug,
            isActive: true,
            publishedAt: { $exists: true }
        });

        if (!currentAffair) {
            return NextResponse.json(
                { success: false, message: 'Current affair not found' },
                { status: 404 }
            );
        }

        // Check authentication for premium content
        const authResult = await verifyAuth(request);
        const isAuthenticated = authResult.isValid;

        // Access control: Check if user has access
        if (currentAffair.isPremium || currentAffair.type === 'monthly') {
            if (!isAuthenticated) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Premium content requires authentication',
                        isPremium: true,
                        type: currentAffair.type,
                        title: currentAffair.title,
                        summary: currentAffair.summary
                    },
                    { status: 401 }
                );
            }

            // In a real application, you would check user's subscription status here
            // For now, we'll allow all authenticated users to access premium content
            // TODO: Implement subscription/payment verification
        }

        // Increment view count (analytics)
        await currentAffair.incrementViewCount();

        return NextResponse.json({
            success: true,
            data: currentAffair
        });
    } catch (error) {
        console.error('Error fetching current affair by slug:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch current affair', error: error.message },
            { status: 500 }
        );
    }
}
