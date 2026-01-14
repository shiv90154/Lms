import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await connectDB();

        // Get tokens from cookies
        const accessToken = request.cookies.get('accessToken')?.value;
        const refreshToken = request.cookies.get('refreshToken')?.value;

        // If we have an access token, remove the specific refresh token
        if (accessToken && refreshToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded) {
                const user = await User.findById(decoded.userId);
                if (user) {
                    await user.removeRefreshToken(refreshToken);
                }
            }
        }

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Logout successful'
        });

        // Clear cookies
        response.cookies.set('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/'
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}