'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function EditCoursePage() {
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch course');
            }

            const data = await response.json();
            if (data.success) {
                setCourse(data.data.course);
                setStats(data.data.stats);
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
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleSave = async (updatedData) => {
        try {
            setSaving(true);
            const response = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const data = await response.json();
                setCourse(data.data);
                setError('');
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addModule = async () => {
        const title = prompt('Enter module title:');
        if (!title) return;

        const order = course.modules.length + 1;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ title, order })
            });

            if (response.ok) {
                fetchCourse(); // Refresh course data
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const addChapter = async (moduleId) => {
        const title = prompt('Enter chapter title:');
        if (!title) return;

        const module = course.modules.find(m => m._id === moduleId);
        const order = module.chapters.length + 1;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/chapters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ title, order })
            });

            if (response.ok) {
                fetchCourse(); // Refresh course data
            } else {
                const data = await response.json();
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const addLesson = async (moduleId, chapterId) => {
        const title = prompt('Enter lesson title:');
        if (!title) return;

        const type = prompt('Enter lesson type (video/pdf/text):');
        if (!['video', 'pdf', 'text'].includes(type)) {
            alert('Invalid lesson type');
            return;
        }

        const content = prompt('Enter lesson content (URL for video/pdf, text content for text):');
        if (!content) return;

        const module = course.modules.find(m => m._id === moduleId);
        const chapter = module.chapters.find(c => c._id === chapterId);
        const order = chapter.lessons.length + 1;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}/lessons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ title, type, content, order })
            });

            if (response.ok) {
                fetchCourse(); // Refresh course data
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
                    <div className="text-lg">Loading course...</div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                    <Button onClick={() => router.push('/admin/courses')}>
                        Back to Courses
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">Course Management</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/courses')}>
                        Back to Courses
                    </Button>
                    <Badge variant={course.isActive ? 'default' : 'secondary'}>
                        {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.enrollments?.completed || 0}</div>
                            <div className="text-sm text-muted-foreground">Total Enrollments</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.completedStudents || 0}</div>
                            <div className="text-sm text-muted-foreground">Completed Students</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{Math.round(stats.averageProgress || 0)}%</div>
                            <div className="text-sm text-muted-foreground">Average Progress</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">₹{course.price}</div>
                            <div className="text-sm text-muted-foreground">Course Price</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
                <Button
                    variant={activeTab === 'details' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('details')}
                >
                    Course Details
                </Button>
                <Button
                    variant={activeTab === 'content' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('content')}
                >
                    Course Content
                </Button>
            </div>

            {/* Course Details Tab */}
            {activeTab === 'details' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>Basic course details and settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input value={course.title} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <Input value={course.category} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Level</label>
                                <Input value={course.level} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <Input value={`₹${course.price}`} readOnly />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={course.description}
                                    readOnly
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags?.map((tag, index) => (
                                        <Badge key={index} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Course Content Tab */}
            {activeTab === 'content' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Course Content</h2>
                        <Button onClick={addModule}>Add Module</Button>
                    </div>

                    {course.modules?.map((module, moduleIndex) => (
                        <Card key={module._id}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Module {module.order}: {module.title}</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addChapter(module._id)}
                                    >
                                        Add Chapter
                                    </Button>
                                </div>
                                {module.description && (
                                    <CardDescription>{module.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {module.chapters?.map((chapter, chapterIndex) => (
                                    <div key={chapter._id} className="ml-4 mb-4 border-l-2 border-gray-200 pl-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">
                                                Chapter {chapter.order}: {chapter.title}
                                            </h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addLesson(module._id, chapter._id)}
                                            >
                                                Add Lesson
                                            </Button>
                                        </div>
                                        {chapter.lessons?.map((lesson, lessonIndex) => (
                                            <div key={lesson._id} className="ml-4 mb-2 p-2 bg-gray-50 rounded">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">
                                                        Lesson {lesson.order}: {lesson.title}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {lesson.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {(!chapter.lessons || chapter.lessons.length === 0) && (
                                            <div className="ml-4 text-sm text-muted-foreground">
                                                No lessons yet
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!module.chapters || module.chapters.length === 0) && (
                                    <div className="text-sm text-muted-foreground">
                                        No chapters yet
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {(!course.modules || course.modules.length === 0) && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No modules created yet</p>
                                <Button onClick={addModule}>Create First Module</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}