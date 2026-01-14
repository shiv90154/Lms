import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/tests/[id] - Get test details (without answers)
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const test = await MockTest.findById(params.id);

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        if (!test.isActive) {
            return apiResponse(null, 'Test is not active', 403);
        }

        // Remove correct answers and explanations for students
        const testData = test.toJSON();
        testData.sections = testData.sections.map(section => ({
            ...section,
            questions: section.questions.map(q => ({
                _id: q._id,
                text: q.text,
                options: q.options,
                marks: q.marks,
                difficulty: q.difficulty,
                subject: q.subject
            }))
        }));

        return apiResponse(testData, 'Test fetched successfully');

    } catch (error) {
        console.error('Error fetching test:', error);
        return apiResponse(null, 'Failed to fetch test', 500);
    }
}
