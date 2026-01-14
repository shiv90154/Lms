import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MockTest from '@/models/MockTest';
import TestAttempt from '@/models/TestAttempt';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// POST /api/tests/[id]/start - Start a test attempt
export async function POST(request, { params }) {
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

        // Check if user has an incomplete attempt
        const existingAttempt = await TestAttempt.findOne({
            userId: authResult.user.userId,
            testId: params.id,
            isCompleted: false
        });

        if (existingAttempt) {
            // Return existing attempt
            return apiResponse({
                attemptId: existingAttempt._id,
                startedAt: existingAttempt.startedAt,
                duration: test.duration,
                test: {
                    _id: test._id,
                    title: test.title,
                    description: test.description,
                    duration: test.duration,
                    totalMarks: test.totalMarks,
                    negativeMarking: test.negativeMarking,
                    instructions: test.instructions,
                    sections: test.sections.map(section => ({
                        _id: section._id,
                        title: section.title,
                        order: section.order,
                        timeLimit: section.timeLimit,
                        questions: section.questions.map(q => ({
                            _id: q._id,
                            text: q.text,
                            options: q.options,
                            marks: q.marks,
                            difficulty: q.difficulty,
                            subject: q.subject
                        }))
                    }))
                }
            }, 'Resuming existing attempt');
        }

        // Count total questions
        let totalQuestions = 0;
        test.sections.forEach(section => {
            totalQuestions += section.questions.length;
        });

        // Create new attempt
        const attempt = new TestAttempt({
            userId: authResult.user.userId,
            testId: params.id,
            answers: [],
            totalMarks: test.totalMarks,
            totalQuestions,
            startedAt: new Date()
        });

        await attempt.save();

        // Increment test attempt count
        await test.incrementAttemptCount();

        return apiResponse({
            attemptId: attempt._id,
            startedAt: attempt.startedAt,
            duration: test.duration,
            test: {
                _id: test._id,
                title: test.title,
                description: test.description,
                duration: test.duration,
                totalMarks: test.totalMarks,
                negativeMarking: test.negativeMarking,
                instructions: test.instructions,
                sections: test.sections.map(section => ({
                    _id: section._id,
                    title: section.title,
                    order: section.order,
                    timeLimit: section.timeLimit,
                    questions: section.questions.map(q => ({
                        _id: q._id,
                        text: q.text,
                        options: q.options,
                        marks: q.marks,
                        difficulty: q.difficulty,
                        subject: q.subject
                    }))
                }))
            }
        }, 'Test attempt started successfully', 201);

    } catch (error) {
        console.error('Error starting test:', error);
        return apiResponse(null, 'Failed to start test', 500);
    }
}
