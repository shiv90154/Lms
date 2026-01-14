import { NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '../lib/auth.js';
import { unauthorizedResponse, sendResponse, serverErrorResponse } from '../lib/api-response.js';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

/**
 * Authentication middleware for API routes with database integration
 */
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            // Get token from Authorization header or cookies
            let token = extractTokenFromHeader(request.headers.get('authorization'));

            if (!token) {
                // Try to get token from cookies
                const cookies = request.headers.get('cookie');
                if (cookies) {
                    const tokenMatch = cookies.match(/accessToken=([^;]+)/);
                    token = tokenMatch ? tokenMatch[1] : null;
                }
            }

            if (!token) {
                return sendResponse(null, 401, unauthorizedResponse('No token provided'));
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                return sendResponse(null, 401, unauthorizedResponse('Invalid or expired token'));
            }

            // Connect to database and verify user exists and is active
            await connectDB();
            const user = await User.findById(decoded.userId).select('-password -refreshTokens');

            if (!user || !user.isActive) {
                return sendResponse(null, 401, unauthorizedResponse('User not found or inactive'));
            }

            // Add user info to request context
            request.user = user;

            // Check role if required
            if (options.role && user.role !== options.role) {
                return sendResponse(null, 403, unauthorizedResponse('Insufficient permissions'));
            }

            return handler(request, context);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return sendResponse(null, 500, serverErrorResponse());
        }
    };
}

/**
 * Admin-only middleware
 */
export function withAdminAuth(handler) {
    return withAuth(handler, { role: 'admin' });
}

/**
 * Student-only middleware
 */
export function withStudentAuth(handler) {
    return withAuth(handler, { role: 'student' });
}

/**
 * Middleware for refresh token validation
 */
export async function validateRefreshToken(request) {
    try {
        const cookies = request.headers.get('cookie');
        if (!cookies) {
            return { success: false, error: 'No refresh token provided' };
        }

        const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
        const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

        if (!refreshToken) {
            return { success: false, error: 'No refresh token provided' };
        }

        await connectDB();

        // Find active session with this refresh token
        const session = await Session.findOne({
            refreshToken,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('userId');

        if (!session) {
            return { success: false, error: 'Invalid or expired refresh token' };
        }

        // Update session activity
        await session.updateActivity();

        return { success: true, user: session.userId, session };
    } catch (error) {
        console.error('Refresh token validation error:', error);
        return { success: false, error: 'Token validation failed' };
    }
}

/**
 * Utility function to check if user has permission for resource
 */
export function hasPermission(user, resource, action = 'read') {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Students can only access their own resources
    if (user.role === 'student') {
        switch (resource) {
            case 'profile':
            case 'courses':
            case 'orders':
            case 'tests':
                return action === 'read' || action === 'update';
            default:
                return false;
        }
    }

    return false;
}

// Export alias for backward compatibility
export const verifyAuth = withAuth;