import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import { sendResponse, successResponse, errorResponse } from '../../../../lib/api-response.js';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { token, password } = body;

        // Validate required fields
        if (!token || !password) {
            return sendResponse(null, 400, errorResponse('Token and password are required'));
        }

        // Validate password strength
        if (password.length < 6) {
            return sendResponse(null, 400, errorResponse('Password must be at least 6 characters long'));
        }

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
            isActive: true
        });

        if (!user) {
            return sendResponse(null, 400, errorResponse('Invalid or expired reset token'));
        }

        // Update password and clear reset token
        user.password = password; // Will be hashed by pre-save middleware
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Clear all refresh tokens to force re-login
        user.refreshTokens = [];

        await user.save();

        return sendResponse(
            null,
            200,
            successResponse('Password has been reset successfully. Please log in with your new password.')
        );

    } catch (error) {
        console.error('Reset password error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return sendResponse(null, 400, errorResponse(messages.join(', ')));
        }

        return sendResponse(null, 500, errorResponse('Internal server error'));
    }
}