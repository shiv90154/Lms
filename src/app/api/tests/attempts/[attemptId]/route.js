import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestAttempt from '@/models/TestAttempt';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/tests/attempts/[attemptId] - Get test attempt results
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const attempt = await TestAttempt.findById(params.attemptId)
            .populate('testId', 'title description category examType negativeMarking')
            .populate('userId', 'firstName lastName email');

        if (!attempt) {
            return apiResponse(null, 'Test attempt not found', 404);
        }

        // Verify ownership (users can only see their own attempts, admins can see all)
        if (authResult.user.role !== 'admin' && attempt.userId._id.toString() !== authResult.user.userId) {
            return apiResponse(null, 'Unauthorized', 403);
        }

        return apiResponse(attempt, 'Test attempt fetched successfully');

    } catch (error) {
        console.error('Error fetching test attempt:', error);
        return apiResponse(null, 'Failed to fetch test attempt', 500);
    }
}
