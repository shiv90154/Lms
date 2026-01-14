import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import MaterialPurchase from '@/models/MaterialPurchase';
import { verifyAuth } from '@/middleware/auth';
import { createRazorpayOrder } from '@/lib/razorpay';

// POST /api/study-materials/[id]/purchase - Initiate purchase for study material
export async function POST(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { id } = params;

        // Get the study material
        const material = await StudyMaterial.findById(id);

        if (!material || !material.isActive) {
            return NextResponse.json(
                { error: 'Study material not found' },
                { status: 404 }
            );
        }

        // Check if material is paid
        if (!material.isPaid) {
            return NextResponse.json(
                { error: 'This material is free and does not require purchase' },
                { status: 400 }
            );
        }

        // Check if user has already purchased
        const existingPurchase = await MaterialPurchase.hasPurchased(
            authResult.user.userId,
            id
        );

        if (existingPurchase) {
            return NextResponse.json(
                { error: 'You have already purchased this material' },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder({
            amount: material.price,
            currency: 'INR',
            receipt: `material_${id}_${Date.now()}`,
            notes: {
                materialId: id,
                userId: authResult.user.userId,
                type: 'study_material'
            }
        });

        // Create purchase record
        const purchase = await MaterialPurchase.create({
            userId: authResult.user.userId,
            materialId: id,
            amount: material.price,
            paymentStatus: 'pending',
            razorpayOrderId: razorpayOrder.id
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: material.price,
                currency: 'INR',
                purchaseId: purchase._id,
                material: {
                    id: material._id,
                    title: material.title,
                    type: material.type
                }
            }
        });

    } catch (error) {
        console.error('Error initiating purchase:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
