import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import { generatePasswordResetToken } from '../../../../lib/auth.js';
import { sendPasswordResetEmail } from '../../../../lib/email.js';
import { sendResponse, successResponse, errorResponse } from '../../../../lib/api-response.js';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { email } = body;

        // Validate email
        if (!email) {
            return sendResponse(null, 400, errorResponse('Email is required'));
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return sendResponse(null, 400, errorResponse('Invalid email format'));
        }

        // Find user by email
        const user = await User.findByEmail(email);

        // Always return success to prevent email enumeration attacks
        // But only send email if user exists
        if (user && user.isActive) {
            // Generate reset token
            const resetToken = generatePasswordResetToken();
            const resetExpires = new Date();
            resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour from now

            // Save reset token to user
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = resetExpires;
            await user.save();

            // Send password reset email
            const emailResult = await sendPasswordResetEmail(
                user.email,
                resetToken,
                user.firstName
            );

            if (!emailResult.success) {
                console.error('Failed to send password reset email:', emailResult.error);
                // Don't expose email sending errors to client
            }
        }

        // Always return success message
        return sendResponse(
            null,
            200,
            successResponse('If an account with that email exists, we have sent a password reset link.')
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return sendResponse(null, 500, errorResponse('Internal server error'));
    }
}