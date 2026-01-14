'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const router = useRouter();

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10'
            });

            if (searchTerm) params.append('search', searchTerm);
            if (filterCategory) params.append('category', filterCategory);
            if (filterLevel) params.append('level', filterLevel);
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const response = await fetch(`/api/admin/courses?${params}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            if (data.success) {
                setCourses(data.data.courses);
                setPagination(data.data.pagination);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [currentPage, searchTerm, filterCategory, filterLevel, filterStatus]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (type, value) => {
        if (type === 'category') setFilterCategory(value);
        if (type === 'level') setFilterLevel(value);
        if (type === 'status') setFilterStatus(value);
        setCurrentPage(1);
    };

    const toggleCourseStatus = async (courseId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    isActive: !currentStatus
                })
            });

            if (response.ok) {
                fetchCourses(); // Refresh the list
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading courses...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Course Management</h1>
                    <p className="text-muted-foreground">Manage all courses in the system</p>
                </div>
                <Link href="/admin/courses/create">
                    <Button>Create New Course</Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={filterCategory}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="programming">Programming</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={filterLevel}
                                onChange={(e) => handleFilterChange('level', e.target.value)}
                            >
                                <option value="">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={filterStatus}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {courses.map((course) => (
                    <Card key={course._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {course.description}
                                    </CardDescription>
                                </div>
                                <Badge variant={course.isActive ? 'default' : 'secondary'}>
                                    {course.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Category:</span>
                                    <span className="font-medium">{course.category}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Level:</span>
                                    <span className="font-medium capitalize">{course.level}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Price:</span>
                                    <span className="font-medium">₹{course.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Enrollments:</span>
                                    <span className="font-medium">{course.enrollmentCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Modules:</span>
                                    <span className="font-medium">{course.modules?.length || 0}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/admin/courses/${course._id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant={course.isActive ? 'destructive' : 'default'}
                                    onClick={() => toggleCourseStatus(course._id, course.isActive)}
                                    className="flex-1"
                                >
                                    {course.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {courses.length === 0 && !loading && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No courses found</p>
                        <Link href="/admin/courses/create">
                            <Button className="mt-4">Create Your First Course</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}