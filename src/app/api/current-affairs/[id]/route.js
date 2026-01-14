import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch single current affair with access control and view tracking
export async function GET(request, { params }) {
    try {
        await connectDB();

        const currentAffair = await CurrentAffair.findById(params.id);

        if (!currentAffair) {
            return NextResponse.json(
                { success: false, message: 'Current affair not found' },
                { status: 404 }
            );
        }

        // Check if content is published
        if (!currentAffair.isPublished()) {
            return NextResponse.json(
                { success: false, message: 'Content not available' },
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
                        type: currentAffair.type
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
        console.error('Error fetching current affair:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch current affair', error: error.message },
            { status: 500 }
        );
    }
}
