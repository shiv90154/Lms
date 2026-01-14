import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import MaterialPurchase from '@/models/MaterialPurchase';
import { verifyAuth } from '@/middleware/auth';

// GET /api/study-materials/[id]/download - Download study material with access control
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

        // Check access for paid materials
        if (material.isPaid) {
            const hasPurchased = await MaterialPurchase.hasPurchased(
                authResult.user.userId,
                id
            );

            if (!hasPurchased) {
                return NextResponse.json(
                    { error: 'Access denied. Please purchase this material first.' },
                    { status: 403 }
                );
            }

            // Update purchase download count
            const purchase = await MaterialPurchase.findOne({
                userId: authResult.user.userId,
                materialId: id,
                paymentStatus: 'completed'
            });

            if (purchase) {
                await purchase.incrementDownload();
            }
        }

        // Increment material download count
        await material.incrementDownloadCount();

        // Return download URL
        return NextResponse.json({
            success: true,
            data: {
                downloadUrl: material.fileUrl,
                fileName: material.title,
                fileSize: material.fileSize,
                fileType: material.type
            }
        });

    } catch (error) {
        console.error('Error downloading material:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
