'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnrollmentPrompt from '@/components/course/EnrollmentPrompt';
import LessonViewer from '@/components/course/LessonViewer';

export default function CoursePage() {
    const params = useParams();
    const courseId = params.id;
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);

    const {
        courseData,
        access,
        loading,
        error,
        hasLessonAccess,
        canAccessContent,
        getProgressPercentage,
        isLessonCompleted,
        refreshAccess
    } = useCourseAccess(courseId);

    // Auto-select first available lesson
    useEffect(() => {
        if (courseData && courseData.modules && !selectedLesson) {
            for (const module of courseData.modules) {
                for (const chapter of module.chapters) {
                    for (const lesson of chapter.lessons) {
                        if (hasLessonAccess(lesson) || !access.hasAccess) {
                            setSelectedLesson(lesson);
                            setSelectedModule(module);
                            setSelectedChapter(chapter);
                            return;
                        }
                    }
                }
            }
        }
    }, [courseData, access.hasAccess, hasLessonAccess, selectedLesson]);

    const handleLessonSelect = (lesson, module, chapter) => {
        setSelectedLesson(lesson);
        setSelectedModule(module);
        setSelectedChapter(chapter);
    };

    const handleLessonComplete = (lessonId, timeSpent, result) => {
        // Refresh access data to update progress
        refreshAccess();

        // Show completion message or certificate if course is completed
        if (result && result.certificateIssued) {
            alert('Congratulations! You have completed the course and earned a certificate!');
        }
    };

    const handleEnrollment = (enrollmentData) => {
        // Refresh access data after enrollment
        refreshAccess();
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

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                    <Button onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Course Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
                        <p className="text-gray-600 mb-4">{courseData.description}</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline">{courseData.category}</Badge>
                            <Badge variant="outline" className="capitalize">{courseData.level}</Badge>
                            {access.hasAccess && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    Enrolled
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {courseData.price === 0 ? 'Free' : `₹${courseData.price.toLocaleString()}`}
                        </div>
                        {access.hasAccess && (
                            <div className="text-sm text-gray-600 mt-1">
                                Progress: {getProgressPercentage()}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {access.hasAccess && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Course Content Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>
                                {courseData.modules?.length || 0} modules • {courseData.totalLessons || 0} lessons
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-96 overflow-y-auto">
                                {courseData.modules?.map((module, moduleIndex) => (
                                    <div key={module._id} className="border-b last:border-b-0">
                                        <div className="p-4 bg-gray-50">
                                            <h4 className="font-semibold text-sm">
                                                Module {module.order}: {module.title}
                                            </h4>
                                        </div>
                                        {module.chapters?.map((chapter, chapterIndex) => (
                                            <div key={chapter._id} className="pl-4">
                                                <div className="p-2 bg-gray-25 border-b">
                                                    <h5 className="font-medium text-sm text-gray-700">
                                                        Chapter {chapter.order}: {chapter.title}
                                                    </h5>
                                                </div>
                                                {chapter.lessons?.map((lesson, lessonIndex) => (
                                                    <button
                                                        key={lesson._id}
                                                        onClick={() => handleLessonSelect(lesson, module, chapter)}
                                                        className={`w-full text-left p-3 pl-8 hover:bg-gray-50 border-b last:border-b-0 ${selectedLesson?._id === lesson._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                                            }`}
                                                        disabled={!hasLessonAccess(lesson) && access.hasAccess}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium">
                                                                    {lesson.order}. {lesson.title}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {lesson.type}
                                                                    </Badge>
                                                                    {lesson.duration && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                {isLessonCompleted(lesson._id) && (
                                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                                {lesson.isLocked && !access.hasAccess && (
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {!access.hasAccess ? (
                        <EnrollmentPrompt
                            course={courseData}
                            onEnroll={handleEnrollment}
                        />
                    ) : selectedLesson ? (
                        <LessonViewer
                            lesson={selectedLesson}
                            courseId={courseId}
                            isEnrolled={access.isEnrolled}
                            onLessonComplete={handleLessonComplete}
                        />
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <h3 className="text-lg font-semibold mb-2">Welcome to the Course!</h3>
                                <p className="text-gray-600 mb-4">
                                    Select a lesson from the sidebar to get started.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}