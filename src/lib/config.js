/**
 * Application configuration
 */

export const config = {
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Premium LMS System',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'A comprehensive Learning Management System with course management, e-commerce, and assessment tools',
    },

    database: {
        uri: process.env.MONGODB_URI,
        name: process.env.MONGODB_DB_NAME || 'premium-lms',
    },

    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    payment: {
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
        },
    },

    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

    upload: {
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
        },
    },

    features: {
        enableRegistration: true,
        enablePayments: true,
        enableEmailNotifications: true,
        enableFileUploads: true,
    },

    ui: {
        itemsPerPage: 10,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
};

/**
 * Validate required environment variables
 */
export function validateConfig() {
    const required = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default config;