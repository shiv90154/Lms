import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestAttempt from '@/models/TestAttempt';
import MockTest from '@/models/MockTest';
import { verifyAuth } from '@/middleware/auth';
import { apiResponse } from '@/lib/api-response';

// GET /api/tests/attempts/[attemptId]/answers - Get answer key with explanations
export async function GET(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return apiResponse(null, 'Unauthorized', 401);
        }

        await connectDB();

        const attempt = await TestAttempt.findById(params.attemptId);

        if (!attempt) {
            return apiResponse(null, 'Test attempt not found', 404);
        }

        // Verify ownership
        if (authResult.user.role !== 'admin' && attempt.userId.toString() !== authResult.user.userId) {
            return apiResponse(null, 'Unauthorized', 403);
        }

        // Check if test is completed
        if (!attempt.isCompleted) {
            return apiResponse(null, 'Test must be completed to view answers', 403);
        }

        // Get the test with all questions and answers
        const test = await MockTest.findById(attempt.testId);

        if (!test) {
            return apiResponse(null, 'Test not found', 404);
        }

        // Build answer key with user's answers
        const answerKey = test.sections.map(section => ({
            sectionId: section._id,
            sectionTitle: section.title,
            questions: section.questions.map(question => {
                const userAnswer = attempt.answers.find(a => a.questionId.toString() === question._id.toString());

                return {
                    questionId: question._id,
                    text: question.text,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation,
                    marks: question.marks,
                    difficulty: question.difficulty,
                    subject: question.subject,
                    userAnswer: userAnswer ? {
                        selectedAnswer: userAnswer.selectedAnswer,
                        isCorrect: userAnswer.isCorrect,
                        marksAwarded: userAnswer.marksAwarded
                    } : null
                };
            })
        }));

        return apiResponse({
            testTitle: test.title,
            negativeMarking: test.negativeMarking,
            answerKey
        }, 'Answer key fetched successfully');

    } catch (error) {
        console.error('Error fetching answer key:', error);
        return apiResponse(null, 'Failed to fetch answer key', 500);
    }
}
