import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET() {
    try {
        // Check database connection
        await connectDB();

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            database: 'connected'
        }, { status: 200 });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            database: 'disconnected'
        }, { status: 503 });
    }
}
