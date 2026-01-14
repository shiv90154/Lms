'use client';

import { useState, useEffect, useCallback } from 'react';

export function useVideoProgress(courseId, lessonId) {
    const [progress, setProgress] = useState({
        isCompleted: false,
        lastPosition: 0,
        timeSpent: 0,
        loading: true,
        error: null
    });

    // Fetch initial progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setProgress(prev => ({
                            ...prev,
                            ...data.data,
                            loading: false,
                            error: null
                        }));
                    } else {
                        setProgress(prev => ({
                            ...prev,
                            loading: false,
                            error: data.message
                        }));
                    }
                } else {
                    setProgress(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to fetch progress'
                    }));
                }
            } catch (error) {
                setProgress(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
            }
        };

        if (courseId && lessonId) {
            fetchProgress();
        }
    }, [courseId, lessonId]);

    // Update progress function
    const updateProgress = useCallback(async (currentTime, timeSpent, isCompleted = false) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentTime,
                    timeSpent,
                    isCompleted
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProgress(prev => ({
                        ...prev,
                        lastPosition: currentTime,
                        timeSpent: timeSpent,
                        isCompleted: isCompleted || prev.isCompleted,
                        error: null
                    }));
                    return data.data;
                } else {
                    setProgress(prev => ({
                        ...prev,
                        error: data.message
                    }));
                    return null;
                }
            } else {
                setProgress(prev => ({
                    ...prev,
                    error: 'Failed to update progress'
                }));
                return null;
            }
        } catch (error) {
            setProgress(prev => ({
                ...prev,
                error: error.message
            }));
            return null;
        }
    }, [courseId, lessonId]);

    // Mark lesson as completed
    const markCompleted = useCallback(async (timeSpent = 0) => {
        return await updateProgress(progress.lastPosition, timeSpent, true);
    }, [updateProgress, progress.lastPosition]);

    // Save current position (for video resume)
    const savePosition = useCallback(async (currentTime, timeSpent = 0) => {
        return await updateProgress(currentTime, timeSpent, false);
    }, [updateProgress]);

    return {
        progress,
        updateProgress,
        markCompleted,
        savePosition,
        isLoading: progress.loading,
        error: progress.error
    };
}