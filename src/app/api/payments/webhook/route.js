import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { apiResponse } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * POST /api/payments/webhook
 * Handle Razorpay webhook notifications
 * 
 * This endpoint receives payment status updates from Razorpay
 * and updates the order status accordingly.
 */
export async function POST(request) {
    try {
        // Get webhook signature from headers
        const webhookSignature = request.headers.get('x-razorpay-signature');

        if (!webhookSignature) {
            console.error('Webhook signature missing');
            return apiResponse(null, 'Webhook signature missing', 400);
        }

        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('Webhook secret not configured');
            return apiResponse(null, 'Webhook configuration error', 500);
        }

        const isValid = verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);

        if (!isValid) {
            console.error('Invalid webhook signature');
            return apiResponse(null, 'Invalid webhook signature', 400);
        }

        // Parse webhook payload
        const payload = JSON.parse(rawBody);
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;
        const orderEntity = payload.payload?.order?.entity;

        console.log('Webhook received:', event);

        // Connect to database
        await connectDB();

        // Handle different webhook events
        switch (event) {
            case 'payment.authorized':
                await handlePaymentAuthorized(paymentEntity);
                break;

            case 'payment.captured':
                await handlePaymentCaptured(paymentEntity);
                break;

            case 'payment.failed':
                await handlePaymentFailed(paymentEntity);
                break;

            case 'order.paid':
                await handleOrderPaid(orderEntity);
                break;

            case 'refund.created':
                await handleRefundCreated(payload.payload?.refund?.entity);
                break;

            case 'refund.processed':
                await handleRefundProcessed(payload.payload?.refund?.entity);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        // Return success response
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payment) {
    try {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });

        if (!order) {
            console.error('Order not found for payment:', payment.id);
            return;
        }

        console.log('Payment authorized:', payment.id);

        // Update order with payment ID if not already set
        if (!order.razorpayPaymentId) {
            order.razorpayPaymentId = payment.id;
            await order.save();
        }

    } catch (error) {
        console.error('Handle payment authorized error:', error);
    }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payment) {
    try {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });

        if (!order) {
            console.error('Order not found for payment:', payment.id);
            return;
        }

        console.log('Payment captured:', payment.id);

        // Update order status to completed
        if (order.paymentStatus !== 'completed') {
            await order.updatePaymentStatus('completed', payment.id);
            console.log('Order payment status updated to completed:', order.orderNumber);
        }

    } catch (error) {
        console.error('Handle payment captured error:', error);
    }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment) {
    try {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });

        if (!order) {
            console.error('Order not found for payment:', payment.id);
            return;
        }

        console.log('Payment failed:', payment.id);

        // Update order status to failed
        if (order.paymentStatus !== 'failed') {
            await order.updatePaymentStatus('failed', payment.id);

            // Add failure reason to order notes
            order.orderNotes = `Payment failed: ${payment.error_description || 'Unknown error'}`;
            await order.save();

            console.log('Order payment status updated to failed:', order.orderNumber);
        }

    } catch (error) {
        console.error('Handle payment failed error:', error);
    }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(razorpayOrder) {
    try {
        const order = await Order.findOne({ razorpayOrderId: razorpayOrder.id });

        if (!order) {
            console.error('Order not found for Razorpay order:', razorpayOrder.id);
            return;
        }

        console.log('Order paid:', razorpayOrder.id);

        // Update order status to completed if not already
        if (order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            await order.save();
            console.log('Order status updated via order.paid event:', order.orderNumber);
        }

    } catch (error) {
        console.error('Handle order paid error:', error);
    }
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(refund) {
    try {
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });

        if (!order) {
            console.error('Order not found for refund:', refund.id);
            return;
        }

        console.log('Refund created:', refund.id);

        // Update refund status
        order.refundStatus = 'initiated';
        order.refundAmount = refund.amount / 100; // Convert from paise to rupees
        await order.save();

        console.log('Order refund status updated:', order.orderNumber);

    } catch (error) {
        console.error('Handle refund created error:', error);
    }
}

/**
 * Handle refund.processed event
 */
async function handleRefundProcessed(refund) {
    try {
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });

        if (!order) {
            console.error('Order not found for refund:', refund.id);
            return;
        }

        console.log('Refund processed:', refund.id);

        // Update refund and payment status
        order.refundStatus = 'completed';
        order.paymentStatus = 'refunded';
        await order.save();

        console.log('Order refund completed:', order.orderNumber);

    } catch (error) {
        console.error('Handle refund processed error:', error);
    }
}

/**
 * GET /api/payments/webhook
 * Return method not allowed for GET requests
 */
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
