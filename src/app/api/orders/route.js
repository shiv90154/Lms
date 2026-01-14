import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/orders
 * Get user's order history
 */
export async function GET(request) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, authResult.error, 401);
        }

        const userId = authResult.user.id;
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');

        // Connect to database
        await connectDB();

        // Build query
        const query = { user: userId };
        if (status) {
            query.orderStatus = status;
        }

        // Get total count
        const totalOrders = await Order.countDocuments(query);

        // Get orders with pagination
        const orders = await Order.find(query)
            .populate('items.book', 'title author images')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return apiResponse(
            {
                orders,
                pagination: {
                    page,
                    limit,
                    totalOrders,
                    totalPages: Math.ceil(totalOrders / limit),
                    hasMore: page * limit < totalOrders,
                },
            },
            'Orders retrieved successfully',
            200
        );

    } catch (error) {
        console.error('Get orders error:', error);
        return apiResponse(null, 'Failed to retrieve orders', 500);
    }
}
