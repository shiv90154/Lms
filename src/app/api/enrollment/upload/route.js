import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/enrollment/upload
 * Upload enrollment documents
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const documentType = formData.get('documentType');

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file provided' },
                { status: 400 }
            );
        }

        if (!documentType) {
            return NextResponse.json(
                { success: false, message: 'Document type is required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed'
                },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'File size exceeds 5MB limit'
                },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'enrollments');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${documentType}_${timestamp}_${randomString}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Generate public URL
        const fileUrl = `/uploads/enrollments/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                documentType,
                documentUrl: fileUrl,
                fileName: file.name
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to upload file',
                error: error.message
            },
            { status: 500 }
        );
    }
}
