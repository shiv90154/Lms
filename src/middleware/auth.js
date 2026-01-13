import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';
import { unauthorizedResponse, sendResponse } from '@/lib/api-response';

/**
 * Authentication middleware for API routes
 */
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            const authHeader = request.headers.get('authorization');
            const token = extractTokenFromHeader(authHeader);

            if (!token) {
                return sendResponse(null, 401, unauthorizedResponse('No token provided'));
            }

            const decoded = verifyAccessToken(token);
            if (!decoded) {
                return sendResponse(null, 401, unauthorizedResponse('Invalid or expired token'));
            }

            // Add user info to request context
            request.user = decoded;

            // Check role if required
            if (options.role && decoded.role !== options.role) {
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