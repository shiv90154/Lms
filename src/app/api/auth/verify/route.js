import { NextResponse } from 'next/server';
import { withAuth } from '../../../../middleware/auth.js';
import { sendResponse, successResponse } from '../../../../lib/api-response.js';

async function handler(request) {
    // User is already verified by middleware
    const user = request.user;

    return sendResponse(
        {
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
            }
        },
        200,
        successResponse('Token verified successfully')
    );
}

export const GET = withAuth(handler);