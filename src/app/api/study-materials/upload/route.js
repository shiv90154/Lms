import { NextResponse } from 'next/server';
import { verifyAuth } from '@/middleware/auth';

// POST /api/study-materials/upload - Upload study material file (Admin only)
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 50MB limit' },
                { status: 400 }
            );
        }

        // In a production environment, you would upload to cloud storage (S3, Cloudinary, etc.)
        // For now, we'll return a mock URL
        // TODO: Implement actual file upload to cloud storage

        const fileUrl = `/uploads/study-materials/${Date.now()}-${file.name}`;
        const fileSize = file.size;

        return NextResponse.json({
            success: true,
            data: {
                fileUrl,
                fileSize,
                fileName: file.name,
                fileType: file.type
            }
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
