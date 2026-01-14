import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestAttempt from '@/models/TestAttempt';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// POST /api/tests/[id]/save-progress - Save test progress (for refresh protection)
export async function POST(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const body = await request.json();
        const { attemptId, answers } = body;

        if (!attemptId) {
            return apiResponse(null, 'Attempt ID is required', 400);
        }

        // Find the attempt
        const attempt = await TestAttempt.findById(attemptId);

        if (!attempt) {
            return apiResponse(null, 'Test attempt not found', 404);
        }

        // Verify ownership
        if (attempt.userId.toString() !== authResult.user.userId) {
            return apiResponse(null, 'Unauthorized', 403);
        }

        // Check if already completed
        if (attempt.isCompleted) {
            return apiResponse(null, 'Test already submitted', 400);
        }

        // Update answers without marking as complete
        attempt.answers = answers || [];
        await attempt.save();

        return apiResponse({ saved: true }, 'Progress saved successfully');

    } catch (error) {
        console.error('Error saving progress:', error);
        return apiResponse(null, 'Failed to save progress', 500);
    }
}
