import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MaterialPurchase from '@/models/MaterialPurchase';
import { verifyAuth } from '@/middleware/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';

// POST /api/study-materials/verify-payment - Verify payment for study material purchase
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification details' },
                { status: 400 }
            );
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Find and update purchase
        const purchase = await MaterialPurchase.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: authResult.user.userId
        }).populate('materialId');

        if (!purchase) {
            return NextResponse.json(
                { error: 'Purchase not found' },
                { status: 404 }
            );
        }

        // Update purchase status
        purchase.paymentStatus = 'completed';
        purchase.razorpayPaymentId = razorpay_payment_id;
        purchase.razorpaySignature = razorpay_signature;
        await purchase.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                purchaseId: purchase._id,
                material: {
                    id: purchase.materialId._id,
                    title: purchase.materialId.title,
                    type: purchase.materialId.type
                }
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
