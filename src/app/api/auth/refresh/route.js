import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import { validateRefreshToken } from '../../../../middleware/auth.js';
import { sendResponse, successResponse, errorResponse } from '../../../../lib/api-response.js';

export async function POST(request) {
    try {
        await connectDB();

        // Validate refresh token
        const tokenResult = await validateRefreshToken(request);

        if (!tokenResult.success) {
            return sendResponse(null, 401, errorResponse(tokenResult.error));
        }

        const { user, session } = tokenResult;

        // Generate new access token
        const { generateAccessToken } = await import('../../../../lib/auth.js');
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };

        const newAccessToken = generateAccessToken(payload);

        // Create response
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
                    emailVerified: user.emailVerified,
                    profile: user.profile
                },
                message: 'Token refreshed successfully'
            })
        );

        // Set new access token cookie
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 // 15 minutes
        });

        return response;

    } catch (error) {
        console.error('Token refresh error:', error);
        return sendResponse(null, 500, errorResponse('Internal server error'));
    }
}