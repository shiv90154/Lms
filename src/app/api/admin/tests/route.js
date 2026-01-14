import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/admin/tests - Get all tests
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const examType = searchParams.get('examType');
        const isActive = searchParams.get('isActive');

        const query = {};
        if (category) query.category = category;
        if (examType) query.examType = examType;
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const tests = await MockTest.find(query)
            .populate('createdBy', 'firstName lastName email')
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

// POST /api/admin/tests - Create new test
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const body = await request.json();
        const {
            title,
            description,
            duration,
            negativeMarking,
            instructions,
            sections,
            category,
            examType,
            difficulty,
            isPaid,
            price
        } = body;

        // Validate required fields
        if (!title || !description || !duration || !sections || sections.length === 0) {
            return apiResponse(null, 'Missing required fields', 400);
        }

        // Validate sections
        for (const section of sections) {
            if (!section.title || !section.questions || section.questions.length === 0) {
                return apiResponse(null, 'Each section must have a title and at least one question', 400);
            }

            // Validate questions
            for (const question of section.questions) {
                if (!question.text || !question.options || question.options.length < 2) {
                    return apiResponse(null, 'Each question must have text and at least 2 options', 400);
                }
                if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                    return apiResponse(null, 'Each question must have a valid correct answer index', 400);
                }
            }
        }

        const test = new MockTest({
            title,
            description,
            duration,
            negativeMarking: negativeMarking || 0,
            instructions: instructions || [],
            sections,
            category,
            examType,
            difficulty: difficulty || 'mixed',
            isPaid: isPaid || false,
            price: price || 0,
            createdBy: authResult.user.userId
        });

        await test.save();

        return apiResponse(test, 'Test created successfully', 201);

    } catch (error) {
        console.error('Error creating test:', error);
        return apiResponse(null, error.message || 'Failed to create test', 500);
    }
}
