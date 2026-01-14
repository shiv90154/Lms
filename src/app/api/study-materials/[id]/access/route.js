import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import MaterialPurchase from '@/models/MaterialPurchase';
import { verifyAuth } from '@/middleware/auth';

// GET /api/study-materials/[id]/access - Check if user has access to material
export async function GET(request, { params }) {
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

        // If material is free, grant access
        if (!material.isPaid) {
            return NextResponse.json({
                success: true,
                data: {
                    hasAccess: true,
                    reason: 'free',
                    material: {
                        id: material._id,
                        title: material.title,
                        type: material.type,
                        fileUrl: material.fileUrl
                    }
                }
            });
        }

        // Check if user has purchased the material
        const hasPurchased = await MaterialPurchase.hasPurchased(
            authResult.user.userId,
            id
        );

        if (hasPurchased) {
            return NextResponse.json({
                success: true,
                data: {
                    hasAccess: true,
                    reason: 'purchased',
                    material: {
                        id: material._id,
                        title: material.title,
                        type: material.type,
                        fileUrl: material.fileUrl
                    }
                }
            });
        }

        // User doesn't have access
        return NextResponse.json({
            success: true,
            data: {
                hasAccess: false,
                reason: 'not_purchased',
                material: {
                    id: material._id,
                    title: material.title,
                    type: material.type,
                    price: material.price
                }
            }
        });

    } catch (error) {
        console.error('Error checking material access:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
