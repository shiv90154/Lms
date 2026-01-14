import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestAttempt from '@/models/TestAttempt';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/tests/attempts - Get user's test attempt history
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const testId = searchParams.get('testId');

        const query = {
            userId: authResult.user.userId,
            isCompleted: true
        };

        if (testId) {
            query.testId = testId;
        }

        const skip = (page - 1) * limit;

        const attempts = await TestAttempt.find(query)
            .populate('testId', 'title description category examType')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TestAttempt.countDocuments(query);

        return apiResponse({
            attempts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'Test attempts fetched successfully');

    } catch (error) {
        console.error('Error fetching test attempts:', error);
        return apiResponse(null, 'Failed to fetch test attempts', 500);
    }
}
