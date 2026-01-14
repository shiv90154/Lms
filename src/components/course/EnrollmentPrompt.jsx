'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EnrollmentPrompt({ course, onEnroll }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleEnrollClick = async () => {
        if (course.price > 0) {
            // Redirect to payment page for paid courses
            router.push(`/courses/${course._id}/checkout`);
        } else {
            // Handle free enrollment
            await handleFreeEnrollment();
        }
    };

    const handleFreeEnrollment = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/courses/${course._id}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    paymentId: 'free_enrollment',
                    orderId: `free_${Date.now()}`
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (onEnroll) {
                    onEnroll(data.data);
                }
                // Refresh the page to show enrolled content
                window.location.reload();
            } else {
                setError(data.message || 'Failed to enroll in course');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price === 0 ? 'Free' : `₹${price.toLocaleString()}`;
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl mb-2">Enroll in this Course</CardTitle>
                        <CardDescription>
                            Get full access to all course content and features
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {formatPrice(course.price)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{course.totalLessons || 0}</div>
                        <div className="text-sm text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{course.totalChapters || 0}</div>
                        <div className="text-sm text-gray-600">Chapters</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {course.totalDuration ? formatDuration(course.totalDuration) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{course.enrollmentCount || 0}</div>
                        <div className="text-sm text-gray-600">Students</div>
                    </div>
                </div>

                {/* What's Included */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-3">What's included:</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Full lifetime access
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Access on mobile and desktop
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Certificate of completion
                        </li>
                        <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Progress tracking
                        </li>
                    </ul>
                </div>

                {/* Instructor Info */}
                {course.instructor && (
                    <div className="mb-6 p-4 bg-white rounded-lg border">
                        <h4 className="font-semibold mb-2">Instructor</h4>
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                {course.instructor.firstName?.[0]}{course.instructor.lastName?.[0]}
                            </div>
                            <div>
                                <div className="font-medium">
                                    {course.instructor.firstName} {course.instructor.lastName}
                                </div>
                                <div className="text-sm text-gray-600">{course.instructor.email}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrollment Button */}
                <Button
                    onClick={handleEnrollClick}
                    disabled={loading}
                    className="w-full text-lg py-6"
                    size="lg"
                >
                    {loading ? 'Processing...' : (
                        course.price > 0 ? `Enroll Now - ${formatPrice(course.price)}` : 'Enroll for Free'
                    )}
                </Button>

                {course.price > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-3">
                        30-day money-back guarantee
                    </p>
                )}
            </CardContent>
        </Card>
    );
}