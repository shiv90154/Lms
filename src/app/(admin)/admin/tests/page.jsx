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

export default function AdminTestsPage() {
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
            const response = await fetch(`/api/admin/tests?page=${pagination.page}&limit=${pagination.limit}`);
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

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this test?')) return;

        try {
            const response = await fetch(`/api/admin/tests/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                fetchTests();
            } else {
                alert(data.message || 'Failed to delete test');
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('Failed to delete test');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/tests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await response.json();

            if (data.success) {
                fetchTests();
            } else {
                alert(data.message || 'Failed to update test');
            }
        } catch (error) {
            console.error('Error updating test:', error);
            alert('Failed to update test');
        }
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Mock Tests</h1>
                    <p className="text-gray-600 mt-1">Manage mock tests and assessments</p>
                </div>
                <Button onClick={() => router.push('/admin/tests/create')}>
                    Create New Test
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tests</CardTitle>
                    <CardDescription>
                        Total: {pagination.total} tests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Attempts</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        No tests found. Create your first test!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tests.map((test) => (
                                    <TableRow key={test._id}>
                                        <TableCell className="font-medium">{test.title}</TableCell>
                                        <TableCell>
                                            {test.category && (
                                                <Badge variant="outline">{test.category}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{test.duration} min</TableCell>
                                        <TableCell>{test.totalQuestions}</TableCell>
                                        <TableCell>{test.attemptCount}</TableCell>
                                        <TableCell>
                                            <Badge variant={test.isActive ? 'default' : 'secondary'}>
                                                {test.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/tests/${test._id}`)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleActive(test._id, test.isActive)}
                                                >
                                                    {test.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(test._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
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
                </CardContent>
            </Card>
        </div>
    );
}
