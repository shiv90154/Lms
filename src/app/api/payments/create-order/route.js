import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';
import { createRazorpayOrder, generateReceiptNumber } from '@/lib/razorpay';
import { apiResponse } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Order from '@/models/Order';

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for checkout
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
        const { shippingAddress, billingAddress } = body;

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
            !shippingAddress.email || !shippingAddress.addressLine1 ||
            !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
            return apiResponse(null, 'Complete shipping address is required', 400);
        }

        // Connect to database
        await connectDB();

        // Get user's cart
        const cart = await Cart.findByUser(userId);
        if (!cart || cart.items.length === 0) {
            return apiResponse(null, 'Cart is empty', 400);
        }

        // Validate cart items
        const validationResults = await cart.validateItems();
        if (validationResults.length > 0) {
            return apiResponse(
                { validationResults },
                'Cart validation failed. Please review your cart.',
                400
            );
        }

        // Calculate order amount
        const totalAmount = cart.totalAmount;
        const shippingCharges = totalAmount >= 500 ? 0 : 50; // Free shipping above ₹500
        const taxAmount = Math.round(totalAmount * 0.18); // 18% GST
        const finalAmount = totalAmount + shippingCharges + taxAmount;

        // Generate receipt number
        const receipt = generateReceiptNumber(userId);

        // Create Razorpay order
        const razorpayResult = await createRazorpayOrder(
            finalAmount,
            'INR',
            receipt,
            {
                userId,
                itemCount: cart.itemCount,
                totalAmount: totalAmount.toString(),
            }
        );

        if (!razorpayResult.success) {
            return apiResponse(null, 'Failed to create payment order', 500);
        }

        // Create order in database
        const order = await Order.createFromCart(
            userId,
            cart.items,
            shippingAddress,
            {
                razorpayOrderId: razorpayResult.order.id,
            }
        );

        // Add additional order details
        order.billingAddress = billingAddress || shippingAddress;
        order.shippingCharges = shippingCharges;
        order.taxAmount = taxAmount;
        order.finalAmount = finalAmount;

        await order.save();

        // Return order details and Razorpay order ID
        return apiResponse({
            orderId: order._id,
            orderNumber: order.orderNumber,
            razorpayOrderId: razorpayResult.order.id,
            amount: finalAmount,
            currency: razorpayResult.order.currency,
            receipt: razorpayResult.order.receipt,
            totalAmount,
            shippingCharges,
            taxAmount,
            finalAmount,
            itemCount: cart.itemCount,
        }, 'Payment order created successfully', 200);

    } catch (error) {
        console.error('Create payment order error:', error);
        return apiResponse(null, 'Failed to create payment order', 500);
    }
}
