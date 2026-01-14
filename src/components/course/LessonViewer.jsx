'use client';

import { useState } from 'react';
import YouTubePlayer from './YouTubePlayer';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LessonViewer({
    lesson,
    courseId,
    isEnrolled = false,
    onLessonComplete,
    onProgressUpdate
}) {
    const [watchTime, setWatchTime] = useState(0);
    const { progress, markCompleted, savePosition, isLoading, error } = useVideoProgress(courseId, lesson._id);

    const handleVideoProgress = async (currentTime) => {
        setWatchTime(prev => prev + 1);

        if (Math.floor(currentTime) % 30 === 0) {
            await savePosition(currentTime, watchTime);
        }

        if (onProgressUpdate) {
            onProgressUpdate(lesson._id, currentTime, watchTime);
        }
    };

    const handleVideoComplete = async () => {
        if (!progress.isCompleted) {
            const result = await markCompleted(watchTime);
            if (result && onLessonComplete) {
                onLessonComplete(lesson._id, watchTime, result);
            }
        }
    };

    const markAsComplete = async () => {
        if (!progress.isCompleted) {
            const result = await markCompleted(watchTime);
            if (result && onLessonComplete) {
                onLessonComplete(lesson._id, watchTime, result);
            }
        }
    };

    const renderLessonContent = () => {
        if (!isEnrolled && lesson.isLocked) {
            return (
                <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="text-center py-12">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Content Locked</h3>
                        <p className="text-gray-600 mb-4">Enroll in this course to access this lesson</p>
                        <Button>Enroll Now</Button>
                    </CardContent>
                </Card>
            );
        }

        switch (lesson.type) {
            case 'video':
                return (
                    <YouTubePlayer
                        videoUrl={lesson.content}
                        onProgress={handleVideoProgress}
                        onComplete={handleVideoComplete}
                        resumeTime={progress.lastPosition || 0}
                        className="w-full"
                    />
                );

            case 'pdf':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">PDF Document</h3>
                            <p className="text-gray-600 mb-4">Click below to view or download the PDF</p>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={() => window.open(lesson.content, '_blank')}>
                                    View PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = lesson.content;
                                        link.download = `${lesson.title}.pdf`;
                                        link.click();
                                    }}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>

                        <div className="w-full h-96 border rounded-lg overflow-hidden">
                            <iframe
                                src={`${lesson.content}#toolbar=0`}
                                className="w-full h-full"
                                title={lesson.title}
                            />
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <Card>
                        <CardContent className="prose max-w-none p-6">
                            <div
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                                className="text-gray-800 leading-relaxed"
                            />
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-gray-600">Unsupported lesson type</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{lesson.title}</h1>
                        <Badge variant={lesson.type === 'video' ? 'default' : 'secondary'}>
                            {lesson.type.toUpperCase()}
                        </Badge>
                        {progress.isCompleted && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                ✓ Completed
                            </Badge>
                        )}
                    </div>

                    {lesson.description && (
                        <p className="text-gray-600 mb-4">{lesson.description}</p>
                    )}

                    {lesson.duration && (
                        <div className="text-sm text-gray-500">
                            Duration: {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')} minutes
                        </div>
                    )}
                </div>

                {isEnrolled && !progress.isCompleted && lesson.type !== 'video' && (
                    <Button onClick={markAsComplete}>
                        Mark as Complete
                    </Button>
                )}
            </div>

            {renderLessonContent()}

            {isEnrolled && (progress.timeSpent > 0 || progress.lastPosition > 0) && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            {progress.timeSpent > 0 && (
                                <span>Time spent: {Math.floor(progress.timeSpent / 60)} minutes</span>
                            )}
                            {progress.lastPosition > 0 && lesson.type === 'video' && (
                                <span>
                                    Last position: {Math.floor(progress.lastPosition / 60)}:{(Math.floor(progress.lastPosition) % 60).toString().padStart(2, '0')}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}