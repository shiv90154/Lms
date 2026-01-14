'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function DownloadScorecardPage() {
    const router = useRouter();
    const params = useParams();
    const { id: testId, attemptId } = params;
    const printRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

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

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const getPerformanceGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading scorecard...</p>
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
                <Button className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #scorecard-print, #scorecard-print * {
                        visibility: visible;
                    }
                    #scorecard-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-break {
                        page-break-after: always;
                    }
                }
            `}</style>

            <div className="container mx-auto p-6 max-w-4xl">
                {/* Action Buttons - Hidden in print */}
                <div className="no-print mb-6 flex gap-4 justify-end">
                    <Button variant="outline" onClick={() => router.back()}>
                        Back to Results
                    </Button>
                    <Button onClick={handlePrint}>
                        Print / Download PDF
                    </Button>
                </div>

                {/* Scorecard Content */}
                <div id="scorecard-print" ref={printRef} className="bg-white">
                    {/* Header */}
                    <div className="border-4 border-blue-600 p-8 mb-6">
                        <div className="text-center mb-6">
                            <h1 className="text-4xl font-bold text-blue-600 mb-2">TEST SCORECARD</h1>
                            <p className="text-gray-600">Official Performance Report</p>
                        </div>

                        <div className="border-t-2 border-gray-300 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Student Name</p>
                                    <p className="text-lg font-semibold">
                                        {result.userId?.firstName} {result.userId?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-lg font-semibold">{result.userId?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Test Name</p>
                                    <p className="text-lg font-semibold">{result.testId?.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Test Date</p>
                                    <p className="text-lg font-semibold">{formatDate(result.submittedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Performance Summary</h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="border-2 border-gray-300 p-4 text-center bg-blue-50">
                                <p className="text-sm text-gray-600 mb-1">Score</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {result.score}/{result.totalMarks}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{result.percentage.toFixed(2)}%</p>
                            </div>
                            <div className="border-2 border-gray-300 p-4 text-center bg-purple-50">
                                <p className="text-sm text-gray-600 mb-1">Rank</p>
                                <p className="text-3xl font-bold text-purple-600">{result.rank}</p>
                                <p className="text-sm text-gray-500 mt-1">of {result.totalAttempts}</p>
                            </div>
                            <div className="border-2 border-gray-300 p-4 text-center bg-green-50">
                                <p className="text-sm text-gray-600 mb-1">Grade</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {getPerformanceGrade(result.percentage)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Performance</p>
                            </div>
                            <div className="border-2 border-gray-300 p-4 text-center bg-orange-50">
                                <p className="text-sm text-gray-600 mb-1">Time</p>
                                <p className="text-3xl font-bold text-orange-600">{formatTime(result.timeSpent)}</p>
                                <p className="text-sm text-gray-500 mt-1">Taken</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Analysis */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Question Analysis</h2>
                        <div className="border-2 border-gray-300">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border-b-2 border-gray-300 p-3 text-left">Metric</th>
                                        <th className="border-b-2 border-gray-300 p-3 text-center">Count</th>
                                        <th className="border-b-2 border-gray-300 p-3 text-center">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border-b border-gray-200 p-3">Total Questions</td>
                                        <td className="border-b border-gray-200 p-3 text-center font-semibold">
                                            {result.totalQuestions}
                                        </td>
                                        <td className="border-b border-gray-200 p-3 text-center">100%</td>
                                    </tr>
                                    <tr className="bg-green-50">
                                        <td className="border-b border-gray-200 p-3">Correct Answers</td>
                                        <td className="border-b border-gray-200 p-3 text-center font-semibold text-green-600">
                                            {result.correctAnswers}
                                        </td>
                                        <td className="border-b border-gray-200 p-3 text-center text-green-600">
                                            {((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                    <tr className="bg-red-50">
                                        <td className="border-b border-gray-200 p-3">Wrong Answers</td>
                                        <td className="border-b border-gray-200 p-3 text-center font-semibold text-red-600">
                                            {result.wrongAnswers}
                                        </td>
                                        <td className="border-b border-gray-200 p-3 text-center text-red-600">
                                            {((result.wrongAnswers / result.totalQuestions) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                    <tr className="bg-yellow-50">
                                        <td className="border-b border-gray-200 p-3">Skipped Questions</td>
                                        <td className="border-b border-gray-200 p-3 text-center font-semibold text-yellow-600">
                                            {result.skippedQuestions}
                                        </td>
                                        <td className="border-b border-gray-200 p-3 text-center text-yellow-600">
                                            {((result.skippedQuestions / result.totalQuestions) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                    <tr className="bg-blue-50">
                                        <td className="p-3 font-semibold">Accuracy</td>
                                        <td className="p-3 text-center font-semibold text-blue-600">
                                            {result.attemptedQuestions}
                                        </td>
                                        <td className="p-3 text-center font-semibold text-blue-600">
                                            {result.accuracy.toFixed(1)}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section-wise Performance */}
                    {result.sectionResults && result.sectionResults.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Section-wise Performance</h2>
                            <div className="border-2 border-gray-300">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border-b-2 border-gray-300 p-3 text-left">Section</th>
                                            <th className="border-b-2 border-gray-300 p-3 text-center">Correct</th>
                                            <th className="border-b-2 border-gray-300 p-3 text-center">Wrong</th>
                                            <th className="border-b-2 border-gray-300 p-3 text-center">Skipped</th>
                                            <th className="border-b-2 border-gray-300 p-3 text-center">Score</th>
                                            <th className="border-b-2 border-gray-300 p-3 text-center">Accuracy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.sectionResults.map((section, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="border-b border-gray-200 p-3 font-medium">
                                                    {section.sectionTitle}
                                                </td>
                                                <td className="border-b border-gray-200 p-3 text-center text-green-600">
                                                    {section.correctAnswers}
                                                </td>
                                                <td className="border-b border-gray-200 p-3 text-center text-red-600">
                                                    {section.wrongAnswers}
                                                </td>
                                                <td className="border-b border-gray-200 p-3 text-center text-yellow-600">
                                                    {section.skippedQuestions}
                                                </td>
                                                <td className="border-b border-gray-200 p-3 text-center font-semibold">
                                                    {section.marksObtained.toFixed(2)}/{section.totalMarks}
                                                </td>
                                                <td className="border-b border-gray-200 p-3 text-center font-semibold">
                                                    {section.accuracy.toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t-2 border-gray-300 pt-6 mt-8">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <p>Generated on: {formatDate(new Date())}</p>
                            <p>Attempt ID: {result._id}</p>
                        </div>
                        <div className="mt-4 text-center text-xs text-gray-500">
                            <p>This is a computer-generated scorecard and does not require a signature.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
