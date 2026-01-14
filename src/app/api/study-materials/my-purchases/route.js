import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MaterialPurchase from '@/models/MaterialPurchase';
import { verifyAuth } from '@/middleware/auth';

// GET /api/study-materials/my-purchases - Get user's purchased materials
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const purchases = await MaterialPurchase.getUserPurchases(authResult.user.userId);

        return NextResponse.json({
            success: true,
            data: purchases
        });

    } catch (error) {
        console.error('Error fetching user purchases:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
