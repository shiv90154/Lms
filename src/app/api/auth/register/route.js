import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import Session from '../../../../models/Session.js';
import { generateEmailVerificationToken, parseDeviceInfo } from '../../../../lib/auth.js';
import { sendResponse, successResponse, errorResponse } from '../../../../lib/api-response.js';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, firstName, lastName, phone } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return sendResponse(
                null,
                400,
                errorResponse('Missing required fields: email, password, firstName, lastName')
            );
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return sendResponse(null, 400, errorResponse('Invalid email format'));
        }

        // Validate password strength
        if (password.length < 6) {
            return sendResponse(null, 400, errorResponse('Password must be at least 6 characters long'));
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return sendResponse(null, 409, errorResponse('User with this email already exists'));
        }

        // Create new user
        const userData = {
            email: email.toLowerCase(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim(),
            emailVerificationToken: generateEmailVerificationToken()
        };

        const user = new User(userData);
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = user.generateTokens();

        // Parse device info
        const userAgent = request.headers.get('user-agent');
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const deviceInfo = parseDeviceInfo(userAgent, ip);

        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        await Session.createSession(user._id, refreshToken, deviceInfo, expiresAt);

        // Set HTTP-only cookies
        const response = NextResponse.json(
            successResponse({
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive,
                    emailVerified: user.emailVerified
                },
                message: 'Registration successful'
            }),
            { status: 201 }
        );

        // Set secure cookies
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 // 15 minutes
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return sendResponse(null, 409, errorResponse('User with this email already exists'));
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendResponse(null, 400, errorResponse(messages.join(', ')));
        }

        return sendResponse(null, 500, errorResponse('Internal server error'));
    }
}