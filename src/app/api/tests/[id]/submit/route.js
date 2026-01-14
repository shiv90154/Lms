import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import TestAttempt from '@/models/TestAttempt';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// POST /api/tests/[id]/submit - Submit test attempt
export async function POST(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const body = await request.json();
        const { attemptId, answers, isAutoSubmit } = body;

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

        // Get the test
        const test = await MockTest.findById(params.id);

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        // Update answers
        attempt.answers = answers || [];

        // Submit the test
        await attempt.submitTest(isAutoSubmit || false);

        // Calculate score
        await attempt.calculateScore(test);

        // Calculate rankings for this test
        await TestAttempt.calculateRankings(params.id);

        // Reload attempt to get updated rank
        const updatedAttempt = await TestAttempt.findById(attemptId)
            .populate('testId', 'title description category examType');

        return apiResponse({
            attemptId: updatedAttempt._id,
            score: updatedAttempt.score,
            totalMarks: updatedAttempt.totalMarks,
            percentage: updatedAttempt.percentage,
            rank: updatedAttempt.rank,
            totalAttempts: updatedAttempt.totalAttempts,
            timeSpent: updatedAttempt.timeSpent,
            correctAnswers: updatedAttempt.correctAnswers,
            wrongAnswers: updatedAttempt.wrongAnswers,
            skippedQuestions: updatedAttempt.skippedQuestions,
            accuracy: updatedAttempt.accuracy,
            sectionResults: updatedAttempt.sectionResults
        }, 'Test submitted successfully');

    } catch (error) {
        console.error('Error submitting test:', error);
        return apiResponse(null, 'Failed to submit test', 500);
    }
}
