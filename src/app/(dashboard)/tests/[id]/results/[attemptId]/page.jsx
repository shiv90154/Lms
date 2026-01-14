'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function TestResultsPage() {
    const router = useRouter();
    const params = useParams();
    const { id: testId, attemptId } = params;

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [attemptId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tests/attempts/${attemptId}`);
            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.message || 'Failed to load results');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceLabel = (percentage) => {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Average';
        return 'Needs Improvement';
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    {error}
                </Alert>
                <Button className="mt-4" onClick={() => router.push('/tests')}>
                    Back to Tests
                </Button>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Test Results</h1>
                <p className="text-gray-600 mt-1">{result.testId?.title}</p>
            </div>

            {/* Overall Performance Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Overall Performance</CardTitle>
                    <CardDescription>Your test performance summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Score</p>
                            <p className={`text-4xl font-bold ${getPerformanceColor(result.percentage)}`}>
                                {result.score}/{result.totalMarks}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {result.percentage.toFixed(2)}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Rank</p>
                            <p className="text-4xl font-bold text-purple-600">
                                {result.rank}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                out of {result.totalAttempts}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                            <p className={`text-4xl font-bold ${getPerformanceColor(result.accuracy)}`}>
                                {result.accuracy.toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {getPerformanceLabel(result.accuracy)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Time Taken</p>
                            <p className="text-4xl font-bold text-blue-600">
                                {formatTime(result.timeSpent)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {result.isAutoSubmitted ? 'Auto-submitted' : 'Manual'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Statistics */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Question Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Questions</p>
                            <p className="text-2xl font-bold">{result.totalQuestions}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Correct</p>
                            <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600">Wrong</p>
                            <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600">Skipped</p>
                            <p className="text-2xl font-bold text-yellow-600">{result.skippedQuestions}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section-wise Performance */}
            {result.sectionResults && result.sectionResults.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Section-wise Performance</CardTitle>
                        <CardDescription>Detailed breakdown by section</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead className="text-center">Questions</TableHead>
                                    <TableHead className="text-center">Attempted</TableHead>
                                    <TableHead className="text-center">Correct</TableHead>
                                    <TableHead className="text-center">Wrong</TableHead>
                                    <TableHead className="text-center">Skipped</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Accuracy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.sectionResults.map((section, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{section.sectionTitle}</TableCell>
                                        <TableCell className="text-center">{section.totalQuestions}</TableCell>
                                        <TableCell className="text-center">{section.attemptedQuestions}</TableCell>
                                        <TableCell className="text-center text-green-600">{section.correctAnswers}</TableCell>
                                        <TableCell className="text-center text-red-600">{section.wrongAnswers}</TableCell>
                                        <TableCell className="text-center text-yellow-600">{section.skippedQuestions}</TableCell>
                                        <TableCell className="text-center font-medium">
                                            {section.marksObtained.toFixed(2)}/{section.totalMarks}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={section.accuracy >= 60 ? 'default' : 'secondary'}>
                                                {section.accuracy.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Performance Insights */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {result.percentage >= 80 && (
                        <Alert className="bg-green-50 border-green-200">
                            <p className="font-medium text-green-900">🎉 Excellent Performance!</p>
                            <p className="text-sm text-green-700">You scored above 80%. Keep up the great work!</p>
                        </Alert>
                    )}
                    {result.percentage >= 60 && result.percentage < 80 && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <p className="font-medium text-blue-900">👍 Good Performance!</p>
                            <p className="text-sm text-blue-700">You scored above 60%. With more practice, you can achieve excellence!</p>
                        </Alert>
                    )}
                    {result.percentage < 60 && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <p className="font-medium text-yellow-900">💪 Room for Improvement</p>
                            <p className="text-sm text-yellow-700">Focus on your weak areas and practice more to improve your score.</p>
                        </Alert>
                    )}

                    {result.wrongAnswers > result.correctAnswers && (
                        <Alert className="bg-orange-50 border-orange-200">
                            <p className="font-medium text-orange-900">⚠️ Accuracy Alert</p>
                            <p className="text-sm text-orange-700">
                                You have more wrong answers than correct ones. Consider reviewing the concepts before attempting more questions.
                            </p>
                        </Alert>
                    )}

                    {result.skippedQuestions > result.totalQuestions / 2 && (
                        <Alert className="bg-purple-50 border-purple-200">
                            <p className="font-medium text-purple-900">📝 Attempt More Questions</p>
                            <p className="text-sm text-purple-700">
                                You skipped more than half the questions. Try to attempt all questions to maximize your score.
                            </p>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push('/tests')}>
                    Back to Tests
                </Button>
                <Button onClick={() => setShowAnswers(!showAnswers)}>
                    {showAnswers ? 'Hide' : 'View'} Answer Key
                </Button>
                <Button onClick={() => router.push(`/tests/${testId}/results/${attemptId}/download`)}>
                    Download Scorecard
                </Button>
            </div>

            {/* Answer Key Section */}
            {showAnswers && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Answer Key & Explanations</CardTitle>
                        <CardDescription>Review your answers and learn from explanations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <p className="text-sm">
                                This feature will display all questions with correct answers and explanations.
                                Implementation requires fetching the full test with answers from the API.
                            </p>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
