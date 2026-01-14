'use client';

import { useState, useEffect } from 'react';

export function useCourseAccess(courseId) {
    const [courseData, setCourseData] = useState(null);
    const [access, setAccess] = useState({
        hasAccess: false,
        isEnrolled: false,
        enrollment: null,
        progress: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCourseAccess = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/courses/${courseId}/access`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCourseData(data.data.course);
                    setAccess(data.data.access);
                } else {
                    setError(data.message);
                }
            } else {
                setError('Failed to fetch course access information');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourseAccess();
        }
    }, [courseId]);

    const checkEnrollmentStatus = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAccess(prev => ({
                        ...prev,
                        hasAccess: data.data.isEnrolled,
                        isEnrolled: data.data.isEnrolled,
                        enrollment: data.data.enrollment
                    }));
                    return data.data.isEnrolled;
                }
            }
            return false;
        } catch (err) {
            console.error('Error checking enrollment status:', err);
            return false;
        }
    };

    const enrollInCourse = async (paymentId = null, orderId = null) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    paymentId,
                    orderId
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Refresh course access data
                await fetchCourseAccess();
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const hasLessonAccess = (lesson) => {
        if (!lesson) return false;

        // If user has course access, check if lesson is locked
        if (access.hasAccess) {
            return !lesson.isLocked;
        }

        // No access to course means no access to lessons
        return false;
    };

    const canAccessContent = () => {
        return access.hasAccess && access.isEnrolled;
    };

    const getProgressPercentage = () => {
        return access.progress?.progressPercentage || 0;
    };

    const isLessonCompleted = (lessonId) => {
        if (!access.progress || !access.progress.completedLessons) {
            return false;
        }

        return access.progress.completedLessons.some(
            lesson => lesson.lessonId === lessonId
        );
    };

    const refreshAccess = () => {
        fetchCourseAccess();
    };

    return {
        courseData,
        access,
        loading,
        error,
        checkEnrollmentStatus,
        enrollInCourse,
        hasLessonAccess,
        canAccessContent,
        getProgressPercentage,
        isLessonCompleted,
        refreshAccess
    };
}