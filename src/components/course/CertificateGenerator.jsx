'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Award,
    CheckCircle,
    Loader2,
    Download,
    ExternalLink,
    Sparkles
} from 'lucide-react';

export default function CertificateGenerator({
    courseId,
    progress,
    onCertificateGenerated
}) {
    const [certificate, setCertificate] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (progress && progress.progressPercentage === 100) {
            checkExistingCertificate();
        } else {
            setLoading(false);
        }
    }, [progress]);

    const checkExistingCertificate = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/certificates', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const courseCertificate = data.data.find(cert =>
                    cert.courseId._id === courseId
                );

                if (courseCertificate) {
                    setCertificate(courseCertificate);
                }
            }
        } catch (error) {
            console.error('Error checking existing certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCertificate = async () => {
        setGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courseId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate certificate');
            }

            const data = await response.json();
            setCertificate(data.data);

            if (onCertificateGenerated) {
                onCertificateGenerated(data.data);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const downloadCertificate = async () => {
        if (!certificate) return;

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/certificates/${certificate.certificateId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download certificate');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${certificate.certificateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading certificate:', error);
            alert('Failed to download certificate');
        }
    };

    const viewVerification = () => {
        if (!certificate) return;
        const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
        window.open(verificationUrl, '_blank');
    };

    // Don't show anything if course is not completed
    if (!progress || progress.progressPercentage !== 100) {
        return null;
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Checking certificate status...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                        <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <span>Course Certificate</span>
                            {certificate && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Generated
                                </Badge>
                            )}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                            {certificate
                                ? 'Your certificate is ready for download'
                                : 'Congratulations! You\'ve completed the course'
                            }
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {!certificate ? (
                    // Certificate not generated yet
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-medium">
                                Course completed with {progress.progressPercentage}% progress!
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-2">
                            <p>
                                You have successfully completed all lessons in this course.
                                Generate your certificate to showcase your achievement.
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Official certificate with unique verification code</li>
                                <li>Downloadable PDF format</li>
                                <li>Shareable verification link</li>
                                <li>Permanent record of your achievement</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={generateCertificate}
                            disabled={generating}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating Certificate...
                                </>
                            ) : (
                                <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Generate Certificate
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    // Certificate already generated
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        Certificate ID: {certificate.certificateId}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {certificate.grade}
                                </Badge>
                            </div>

                            <div className="text-sm text-gray-600">
                                <div><strong>Student:</strong> {certificate.studentName}</div>
                                <div><strong>Course:</strong> {certificate.courseName}</div>
                                <div><strong>Verification Code:</strong>
                                    <code className="ml-1 bg-gray-100 px-1 rounded">
                                        {certificate.verificationCode}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={downloadCertificate}
                                className="flex-1"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={viewVerification}
                                className="flex-1"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Verify Online
                            </Button>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            Share your achievement! Use the verification link to prove your certification.
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}