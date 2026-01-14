import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/tests - Get all active tests for students
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
        const category = searchParams.get('category');
        const examType = searchParams.get('examType');

        const query = { isActive: true };
        if (category) query.category = category;
        if (examType) query.examType = examType;

        const skip = (page - 1) * limit;

        const tests = await MockTest.find(query)
            .select('-sections.questions.correctAnswer -sections.questions.explanation')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MockTest.countDocuments(query);

        return apiResponse({
            tests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'Tests fetched successfully');

    } catch (error) {
        console.error('Error fetching tests:', error);
        return apiResponse(null, 'Failed to fetch tests', 500);
    }
}
