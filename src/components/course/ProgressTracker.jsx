'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, PlayCircle, BookOpen } from 'lucide-react';

export default function ProgressTracker({ courseId, userId, onLessonComplete }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, [courseId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/courses/${courseId}/progress`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }

            const data = await response.json();
            setProgress(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markLessonComplete = async (lessonId, timeSpent = 0) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'complete_lesson',
                    lessonId,
                    timeSpent
                })
            });

            if (!response.ok) {
                throw new Error('Failed to mark lesson complete');
            }

            const data = await response.json();
            setProgress(data.data);

            if (onLessonComplete) {
                onLessonComplete(lessonId, data.data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const updateCurrentLesson = async (moduleId, chapterId, lessonId) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_current_lesson',
                    moduleId,
                    chapterId,
                    lessonId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update current lesson');
            }

            const data = await response.json();
            setProgress(data.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const isLessonCompleted = (lessonId) => {
        if (!progress) return false;
        return progress.completedLessons.some(
            completion => completion.lessonId === lessonId
        );
    };

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-red-600">
                        Error loading progress: {error}
                    </div>
                    <Button
                        onClick={fetchProgress}
                        variant="outline"
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!progress) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed</span>
                        </div>
                        <div className="text-lg font-bold">
                            {progress.completedLessons.length}
                        </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Time Spent</span>
                        </div>
                        <div className="text-lg font-bold">
                            {formatTime(progress.timeSpent)}
                        </div>
                    </div>
                </div>

                {/* Current Lesson */}
                {progress.currentLesson && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                            <PlayCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Continue Learning</span>
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                            Resume from your last lesson
                        </div>
                    </div>
                )}

                {/* Certificate Status */}
                {progress.progressPercentage === 100 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-green-700 font-medium">
                                    Course Completed!
                                </div>
                                <div className="text-sm text-green-600">
                                    {progress.certificateIssued
                                        ? 'Certificate issued'
                                        : 'Certificate will be issued soon'
                                    }
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                100%
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {progress.completedLessons.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
                        <div className="space-y-1">
                            {progress.completedLessons
                                .slice(-3)
                                .reverse()
                                .map((completion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between text-xs text-gray-600 p-2 bg-gray-50 rounded"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            <span>Lesson completed</span>
                                        </div>
                                        <span>
                                            {new Date(completion.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}