import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';

// POST /api/auth/profile/upload - Upload profile avatar
export async function POST(request) {
    try {
        await connectDB();

        const token = request.cookies.get('accessToken')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Access token required' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('avatar');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum 5MB allowed.' },
                { status: 400 }
            );
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // For now, we'll store the file as base64 in the database
        // In production, you'd want to use a service like Cloudinary or AWS S3
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Update user avatar
        if (!user.profile) user.profile = {};
        user.profile.avatar = dataUrl;

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: dataUrl
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}