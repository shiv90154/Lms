import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/admin/tests/[id] - Get test by ID
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const test = await MockTest.findById(params.id)
            .populate('createdBy', 'firstName lastName email');

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        return apiResponse(test, 'Test fetched successfully');

    } catch (error) {
        console.error('Error fetching test:', error);
        return apiResponse(null, 'Failed to fetch test', 500);
    }
}

// PUT /api/admin/tests/[id] - Update test
export async function PUT(request, { params }) {
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
            price,
            isActive
        } = body;

        const test = await MockTest.findById(params.id);

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        // Update fields
        if (title) test.title = title;
        if (description) test.description = description;
        if (duration) test.duration = duration;
        if (negativeMarking !== undefined) test.negativeMarking = negativeMarking;
        if (instructions) test.instructions = instructions;
        if (sections) {
            // Validate sections before updating
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
            test.sections = sections;
        }
        if (category) test.category = category;
        if (examType) test.examType = examType;
        if (difficulty) test.difficulty = difficulty;
        if (isPaid !== undefined) test.isPaid = isPaid;
        if (price !== undefined) test.price = price;
        if (isActive !== undefined) test.isActive = isActive;

        await test.save();

        return apiResponse(test, 'Test updated successfully');

    } catch (error) {
        console.error('Error updating test:', error);
        return apiResponse(null, error.message || 'Failed to update test', 500);
    }
}

// DELETE /api/admin/tests/[id] - Delete test
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const test = await MockTest.findByIdAndDelete(params.id);

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        return apiResponse({ id: params.id }, 'Test deleted successfully');

    } catch (error) {
        console.error('Error deleting test:', error);
        return apiResponse(null, 'Failed to delete test', 500);
    }
}
