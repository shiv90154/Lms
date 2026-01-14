import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { apiResponse } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature and update order status
 */
export async function POST(request) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, authResult.error, 401);
        }

        const userId = authResult.user.id;

        // Parse request body
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return apiResponse(null, 'Missing payment verification details', 400);
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return apiResponse(null, 'Invalid payment signature', 400);
        }

        // Connect to database
        await connectDB();

        // Find order by Razorpay order ID
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return apiResponse(null, 'Order not found', 404);
        }

        // Verify order belongs to user
        if (order.user.toString() !== userId) {
            return apiResponse(null, 'Unauthorized access to order', 403);
        }

        // Check if payment already processed
        if (order.paymentStatus === 'completed') {
            return apiResponse(
                {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    alreadyProcessed: true,
                },
                'Payment already processed',
                200
            );
        }

        // Update order with payment details
        await order.updatePaymentStatus('completed', razorpay_payment_id, razorpay_signature);

        // Clear user's cart after successful payment
        const cart = await Cart.findByUser(userId);
        if (cart) {
            await cart.clearCart();
        }

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail(order.shippingAddress.email, order);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        // Return success response
        return apiResponse(
            {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentId: razorpay_payment_id,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
            },
            'Payment verified successfully',
            200
        );

    } catch (error) {
        console.error('Payment verification error:', error);
        return apiResponse(null, 'Payment verification failed', 500);
    }
}
