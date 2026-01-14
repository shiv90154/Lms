import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/orders/[id]
 * Get order details by ID
 */
export async function GET(request, { params }) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, authResult.error, 401);
        }

        const userId = authResult.user.id;
        const orderId = params.id;

        // Connect to database
        await connectDB();

        // Find order
        const order = await Order.findById(orderId)
            .populate('user', 'firstName lastName email phone')
            .populate('items.book', 'title author images isbn');

        if (!order) {
            return apiResponse(null, 'Order not found', 404);
        }

        // Verify order belongs to user (or user is admin)
        if (order.user._id.toString() !== userId && authResult.user.role !== 'admin') {
            return apiResponse(null, 'Unauthorized access to order', 403);
        }

        return apiResponse(order, 'Order retrieved successfully', 200);

    } catch (error) {
        console.error('Get order error:', error);
        return apiResponse(null, 'Failed to retrieve order', 500);
    }
}

/**
 * PATCH /api/orders/[id]
 * Update order status (admin only)
 */
export async function PATCH(request, { params }) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, authResult.error, 401);
        }

        // Check if user is admin
        if (authResult.user.role !== 'admin') {
            return apiResponse(null, 'Admin access required', 403);
        }

        const orderId = params.id;
        const body = await request.json();
        const { orderStatus, trackingNumber, courierPartner, estimatedDeliveryDate, adminNotes } = body;

        // Connect to database
        await connectDB();

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return apiResponse(null, 'Order not found', 404);
        }

        // Update order status
        if (orderStatus) {
            await order.updateOrderStatus(orderStatus, adminNotes, authResult.user.id);
        }

        // Update tracking information
        if (trackingNumber && courierPartner) {
            await order.addTrackingInfo(trackingNumber, courierPartner, estimatedDeliveryDate);
        }

        // Update admin notes
        if (adminNotes) {
            order.adminNotes = adminNotes;
            await order.save();
        }

        return apiResponse(order, 'Order updated successfully', 200);

    } catch (error) {
        console.error('Update order error:', error);
        return apiResponse(null, 'Failed to update order', 500);
    }
}
