/**
 * Standardized API response utilities
 */

export class ApiResponse {
    constructor(success, message, data = null, errors = null) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Success response
 */
export function successResponse(message, data = null) {
    return new ApiResponse(true, message, data);
}

/**
 * Error response
 */
export function errorResponse(message, errors = null) {
    return new ApiResponse(false, message, null, errors);
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors) {
    return new ApiResponse(false, 'Validation failed', null, errors);
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource') {
    return new ApiResponse(false, `${resource} not found`);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized access') {
    return new ApiResponse(false, message);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Access forbidden') {
    return new ApiResponse(false, message);
}

/**
 * Server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
    return new ApiResponse(false, message);
}

/**
 * Send JSON response with proper status code
 */
export function sendResponse(response, statusCode, apiResponse) {
    return Response.json(apiResponse, { status: statusCode });
}

/**
 * Handle API errors and send appropriate response
 */
export function handleApiError(error) {
    console.error('API Error:', error);

    if (error.name === 'ValidationError') {
        return sendResponse(null, 400, validationErrorResponse(error.errors));
    }

    if (error.name === 'CastError') {
        return sendResponse(null, 400, errorResponse('Invalid ID format'));
    }

    if (error.code === 11000) {
        return sendResponse(null, 409, errorResponse('Resource already exists'));
    }

    return sendResponse(null, 500, serverErrorResponse());
}

// Alias for backward compatibility
export const apiResponse = ApiResponse;