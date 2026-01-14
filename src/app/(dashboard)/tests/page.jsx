'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestsPage() {
    const router = useRouter();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchTests();
    }, [pagination.page]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tests?page=${pagination.page}&limit=${pagination.limit}`);
            const data = await response.json();

            if (data.success) {
                setTests(data.data.tests);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId) => {
        router.push(`/tests/${testId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading tests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Mock Tests</h1>
                <p className="text-gray-600 mt-1">Practice with our comprehensive mock tests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">No tests available at the moment</p>
                    </div>
                ) : (
                    tests.map((test) => (
                        <Card key={test._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <CardTitle className="text-lg">{test.title}</CardTitle>
                                    {test.isPaid && (
                                        <Badge variant="secondary">₹{test.price}</Badge>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {test.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{test.duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Questions:</span>
                                        <span className="font-medium">{test.totalQuestions}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Marks:</span>
                                        <span className="font-medium">{test.totalMarks}</span>
                                    </div>
                                    {test.category && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Category:</span>
                                            <Badge variant="outline">{test.category}</Badge>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleStartTest(test._id)}
                                >
                                    Start Test
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
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
        </div>
    );
}
