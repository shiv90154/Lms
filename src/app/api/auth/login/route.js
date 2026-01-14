import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { parseDeviceInfo } from '@/lib/auth';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, rememberMe = false } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Account is deactivated. Please contact support.' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate tokens
        const { accessToken, refreshToken } = user.generateTokens();

        // Parse device info
        const userAgent = request.headers.get('user-agent');
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.ip ||
            'unknown';
        const deviceInfo = parseDeviceInfo(userAgent, ip);

        // Add refresh token with device info
        await user.addRefreshToken(refreshToken, JSON.stringify(deviceInfo));

        // Prepare response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                profile: user.profile
            },
            message: 'Login successful'
        });

        // Set secure cookies
        const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days

        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/'
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: cookieMaxAge,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}