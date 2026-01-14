'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, Mail, Phone, Clock } from 'lucide-react';

function EnrollmentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const enrollmentId = searchParams.get('id');

    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!enrollmentId) {
            router.push('/enroll');
            return;
        }

        fetchEnrollmentDetails();
    }, [enrollmentId]);

    const fetchEnrollmentDetails = async () => {
        try {
            const response = await fetch(`/api/enrollment/${enrollmentId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch enrollment details');
            }

            setEnrollment(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p>Loading enrollment details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !enrollment) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardContent className="py-12">
                        <Alert variant="destructive">
                            {error || 'Enrollment not found'}
                        </Alert>
                        <div className="mt-6 text-center">
                            <Button onClick={() => router.push('/enroll')}>
                                Back to Enrollment Form
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl text-green-600">
                        Enrollment Submitted Successfully!
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Thank you for enrolling with us
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Enrollment Details */}
                    <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                        <h3 className="font-semibold text-lg mb-4">Enrollment Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Enrollment ID</p>
                                <p className="font-medium">{enrollment._id}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium capitalize">
                                    {enrollment.status.replace('_', ' ')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Full Name</p>
                                <p className="font-medium">{enrollment.fullName}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{enrollment.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{enrollment.phone}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Submitted On</p>
                                <p className="font-medium">
                                    {new Date(enrollment.submittedAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">What's Next?</h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Check Your Email</p>
                                    <p className="text-sm text-gray-600">
                                        We've sent a confirmation email to {enrollment.email}.
                                        Please check your inbox (and spam folder).
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Application Review</p>
                                    <p className="text-sm text-gray-600">
                                        Our team will review your application within 2-3 business days.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">We'll Contact You</p>
                                    <p className="text-sm text-gray-600">
                                        Once reviewed, we'll contact you via phone or email with the next steps.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Need Help?</strong> If you have any questions or need to update your information,
                            please contact our support team.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={() => router.push('/')}
                            className="flex-1"
                        >
                            Go to Home
                        </Button>
                        <Button
                            onClick={() => router.push('/courses')}
                            variant="outline"
                            className="flex-1"
                        >
                            Browse Courses
                        </Button>
                    </div>

                    {/* Reference Number */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-xs text-gray-500">
                            Please save this enrollment ID for future reference: <br />
                            <span className="font-mono font-semibold">{enrollment._id}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EnrollmentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p>Loading...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <EnrollmentSuccessContent />
        </Suspense>
    );
}
