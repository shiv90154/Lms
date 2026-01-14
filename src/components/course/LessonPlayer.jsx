'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, Pause, FileText, Video } from 'lucide-react';

export default function LessonPlayer({
    lesson,
    courseId,
    moduleId,
    chapterId,
    isCompleted,
    onComplete,
    onTimeUpdate
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const timeTrackingRef = useRef(null);

    useEffect(() => {
        // Start time tracking when component mounts
        startTimeTracking();

        return () => {
            // Stop time tracking when component unmounts
            stopTimeTracking();
        };
    }, []);

    useEffect(() => {
        // Update current lesson when lesson changes
        updateCurrentLesson();
    }, [lesson.id]);

    const startTimeTracking = () => {
        timeTrackingRef.current = setInterval(() => {
            setTimeSpent(prev => prev + 1);
            if (onTimeUpdate) {
                onTimeUpdate(timeSpent + 1);
            }
        }, 60000); // Track every minute
    };

    const stopTimeTracking = () => {
        if (timeTrackingRef.current) {
            clearInterval(timeTrackingRef.current);
            timeTrackingRef.current = null;
        }
    };

    const updateCurrentLesson = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_current_lesson',
                    moduleId,
                    chapterId,
                    lessonId: lesson._id
                })
            });
        } catch (error) {
            console.error('Error updating current lesson:', error);
        }
    };

    const markAsComplete = async () => {
        if (isCompleted) return;

        setLoading(true);
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
                    lessonId: lesson._id,
                    timeSpent: Math.ceil(timeSpent / 60) // Convert seconds to minutes
                })
            });

            if (!response.ok) {
                throw new Error('Failed to mark lesson complete');
            }

            const data = await response.json();

            if (onComplete) {
                onComplete(lesson._id, data.data);
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPlay = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleVideoLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
            return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
        }
        return url;
    };

    const renderContent = () => {
        switch (lesson.type) {
            case 'video':
                if (lesson.content.includes('youtube.com') || lesson.content.includes('youtu.be')) {
                    return (
                        <div className="aspect-video">
                            <iframe
                                src={getYouTubeEmbedUrl(lesson.content)}
                                className="w-full h-full rounded-lg"
                                allowFullScreen
                                title={lesson.title}
                            />
                        </div>
                    );
                } else {
                    return (
                        <div className="aspect-video bg-black rounded-lg relative">
                            <video
                                ref={videoRef}
                                src={lesson.content}
                                className="w-full h-full rounded-lg"
                                onTimeUpdate={handleVideoTimeUpdate}
                                onLoadedMetadata={handleVideoLoadedMetadata}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                controls
                            />
                        </div>
                    );
                }

            case 'pdf':
                return (
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-red-600" />
                            <span className="font-medium">PDF Document</span>
                        </div>
                        <iframe
                            src={lesson.content}
                            className="w-full h-96 border rounded"
                            title={lesson.title}
                        />
                        <div className="mt-4">
                            <Button asChild variant="outline">
                                <a
                                    href={lesson.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in New Tab
                                </a>
                            </Button>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="prose max-w-none">
                        <div
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                            className="text-gray-700 leading-relaxed"
                        />
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        Unsupported content type
                    </div>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                            {lesson.type === 'video' && <Video className="h-5 w-5" />}
                            {lesson.type === 'pdf' && <FileText className="h-5 w-5" />}
                            {lesson.type === 'text' && <FileText className="h-5 w-5" />}
                            {lesson.title}
                        </CardTitle>
                        {lesson.description && (
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            {lesson.duration && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration} min</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Time spent: {Math.ceil(timeSpent / 60)} min</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lesson Content */}
                <div>
                    {renderContent()}
                </div>

                {/* Progress Controls */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                        {isCompleted ? 'Lesson completed' : 'Mark as complete when finished'}
                    </div>
                    <Button
                        onClick={markAsComplete}
                        disabled={isCompleted || loading}
                        className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        {loading ? (
                            'Marking Complete...'
                        ) : isCompleted ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed
                            </>
                        ) : (
                            'Mark Complete'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}