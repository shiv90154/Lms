'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Eye, Mail, Phone, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminEnrollmentsPage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchEnrollments();
    }, [filter, pagination.page]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await fetch(`/api/enrollment?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch enrollments');
            }

            setEnrollments(data.data);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                pages: data.pagination.pages
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'pending': 'secondary',
            'under_review': 'default',
            'approved': 'success',
            'rejected': 'destructive',
            'contacted': 'outline'
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const handleViewDetails = (enrollmentId) => {
        router.push(`/admin/enrollments/${enrollmentId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Student Enrollments</CardTitle>
                    <CardDescription>
                        Manage and track student enrollment applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            {error}
                        </Alert>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                            size="sm"
                        >
                            Pending
                        </Button>
                        <Button
                            variant={filter === 'under_review' ? 'default' : 'outline'}
                            onClick={() => setFilter('under_review')}
                            size="sm"
                        >
                            Under Review
                        </Button>
                        <Button
                            variant={filter === 'contacted' ? 'default' : 'outline'}
                            onClick={() => setFilter('contacted')}
                            size="sm"
                        >
                            Contacted
                        </Button>
                        <Button
                            variant={filter === 'approved' ? 'default' : 'outline'}
                            onClick={() => setFilter('approved')}
                            size="sm"
                        >
                            Approved
                        </Button>
                        <Button
                            variant={filter === 'rejected' ? 'default' : 'outline'}
                            onClick={() => setFilter('rejected')}
                            size="sm"
                        >
                            Rejected
                        </Button>
                    </div>

                    {/* Enrollments Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p>Loading enrollments...</p>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No enrollments found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Target Exam</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {enrollments.map((enrollment) => (
                                            <TableRow key={enrollment._id}>
                                                <TableCell className="font-medium">
                                                    {enrollment.fullName}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="truncate max-w-[200px]">
                                                                {enrollment.email}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{enrollment.phone}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {enrollment.targetExam || 'Not specified'}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(enrollment.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(enrollment.submittedAt).toLocaleDateString('en-IN')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetails(enrollment._id)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <p className="text-sm text-gray-600">
                                        Showing {enrollments.length} of {pagination.total} enrollments
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === 1}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === pagination.pages}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
