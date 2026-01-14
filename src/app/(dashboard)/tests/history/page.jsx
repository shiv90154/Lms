'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function TestHistoryPage() {
    const router = useRouter();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchAttempts();
    }, [pagination.page]);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tests/attempts?page=${pagination.page}&limit=${pagination.limit}`);
            const data = await response.json();

            if (data.success) {
                setAttempts(data.data.attempts);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching attempts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const getPerformanceBadge = (percentage) => {
        if (percentage >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
        if (percentage >= 60) return <Badge className="bg-blue-500">Good</Badge>;
        if (percentage >= 40) return <Badge className="bg-yellow-500">Average</Badge>;
        return <Badge variant="destructive">Poor</Badge>;
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading test history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Test History</h1>
                    <p className="text-gray-600 mt-1">View your past test attempts and performance</p>
                </div>
                <Button onClick={() => router.push('/tests')}>
                    Take New Test
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Attempts</CardTitle>
                    <CardDescription>
                        Total: {pagination.total} attempts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attempts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No test attempts yet</p>
                            <Button onClick={() => router.push('/tests')}>
                                Take Your First Test
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-center">Score</TableHead>
                                        <TableHead className="text-center">Rank</TableHead>
                                        <TableHead className="text-center">Time</TableHead>
                                        <TableHead className="text-center">Performance</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attempts.map((attempt) => (
                                        <TableRow key={attempt._id}>
                                            <TableCell className="font-medium">
                                                {attempt.testId?.title}
                                                {attempt.testId?.category && (
                                                    <Badge variant="outline" className="ml-2">
                                                        {attempt.testId.category}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(attempt.submittedAt)}</TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {attempt.score}/{attempt.totalMarks}
                                                <div className="text-xs text-gray-500">
                                                    {attempt.percentage.toFixed(1)}%
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {attempt.rank}/{attempt.totalAttempts}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatTime(attempt.timeSpent)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getPerformanceBadge(attempt.percentage)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/tests/${attempt.testId._id}/results/${attempt._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/tests/${attempt.testId._id}/results/${attempt._id}/download`)}
                                                    >
                                                        Download
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === pagination.pages}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
