'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Award,
    Download,
    ExternalLink,
    Calendar,
    User,
    BookOpen,
    Shield,
    Copy,
    Check
} from 'lucide-react';

export default function CertificateCard({ certificate, showActions = true }) {
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
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
        } finally {
            setDownloading(false);
        }
    };

    const handleCopyVerificationCode = async () => {
        try {
            await navigator.clipboard.writeText(certificate.verificationCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy verification code:', error);
        }
    };

    const handleViewVerification = () => {
        const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
        window.open(verificationUrl, '_blank');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Certificate of Completion</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                {certificate.certificateId}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-200"
                    >
                        {certificate.grade}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Course Information */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <BookOpen className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                            <div className="font-medium text-gray-900">
                                {certificate.courseName}
                            </div>
                            <div className="text-sm text-gray-600">
                                Course completed successfully
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                            <div className="font-medium text-gray-900">
                                {certificate.studentName}
                            </div>
                            <div className="text-sm text-gray-600">
                                Certificate holder
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                            <div className="font-medium text-gray-900">
                                {formatDate(certificate.completionDate)}
                            </div>
                            <div className="text-sm text-gray-600">
                                Completion date
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Section */}
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Shield className="h-4 w-4" />
                        Verification Code
                    </div>
                    <div className="flex items-center justify-between">
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {certificate.verificationCode}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyVerificationCode}
                            className="h-8 w-8 p-0"
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Metadata */}
                {certificate.metadata && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-medium text-blue-900">
                                {certificate.metadata.totalLessons}
                            </div>
                            <div className="text-blue-600">Lessons</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-medium text-green-900">
                                {Math.ceil(certificate.metadata.timeSpent / 60)}h
                            </div>
                            <div className="text-green-600">Time Spent</div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex-1"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {downloading ? 'Downloading...' : 'Download PDF'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleViewVerification}
                            className="flex-1"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify
                        </Button>
                    </div>
                )}

                {/* Issue Date */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Issued on {formatDate(certificate.issueDate)}
                    {certificate.downloadCount > 0 && (
                        <span className="ml-2">• Downloaded {certificate.downloadCount} times</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}