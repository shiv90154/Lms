import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('Please define JWT secrets in environment variables');
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Generate secure random token for password reset
 */
export function generatePasswordResetToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Parse device info from user agent
 */
export function parseDeviceInfo(userAgent, ip) {
    // Simple device info parsing - in production, consider using a library like 'ua-parser-js'
    const deviceInfo = {
        userAgent: userAgent || 'Unknown',
        ip: ip || 'Unknown',
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Unknown'
    };

    if (userAgent) {
        // Basic browser detection
        if (userAgent.includes('Chrome')) deviceInfo.browser = 'Chrome';
        else if (userAgent.includes('Firefox')) deviceInfo.browser = 'Firefox';
        else if (userAgent.includes('Safari')) deviceInfo.browser = 'Safari';
        else if (userAgent.includes('Edge')) deviceInfo.browser = 'Edge';

        // Basic OS detection
        if (userAgent.includes('Windows')) deviceInfo.os = 'Windows';
        else if (userAgent.includes('Mac')) deviceInfo.os = 'macOS';
        else if (userAgent.includes('Linux')) deviceInfo.os = 'Linux';
        else if (userAgent.includes('Android')) deviceInfo.os = 'Android';
        else if (userAgent.includes('iOS')) deviceInfo.os = 'iOS';

        // Basic device detection
        if (userAgent.includes('Mobile')) deviceInfo.device = 'Mobile';
        else if (userAgent.includes('Tablet')) deviceInfo.device = 'Tablet';
        else deviceInfo.device = 'Desktop';
    }

    return deviceInfo;
}

// Export alias for backward compatibility
export const verifyToken = verifyAccessToken;