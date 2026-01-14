'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Award,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    User,
    BookOpen,
    Shield,
    ExternalLink
} from 'lucide-react';

export default function CertificateVerificationPage({ params }) {
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const verificationCode = params.code;

    useEffect(() => {
        if (verificationCode) {
            verifyCertificate();
        }
    }, [verificationCode]);

    const verifyCertificate = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/certificates/verify/${verificationCode}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Certificate not found or invalid');
                }
                throw new Error('Failed to verify certificate');
            }

            const data = await response.json();
            setCertificate(data.data.certificate);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async () => {
        if (!certificate) return;

        try {
            const response = await fetch(`/api/certificates/${certificate.certificateId}/download`);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Certificate Verification
                    </h1>
                    <p className="text-gray-600">
                        Verify the authenticity of educational certificates
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-xl">
                            Verification Code: {verificationCode}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {loading && (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                                <p className="text-gray-600">Verifying certificate...</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-red-900 mb-2">
                                    Verification Failed
                                </h3>
                                <p className="text-red-700 mb-4">{error}</p>
                                <Button
                                    onClick={verifyCertificate}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {certificate && (
                            <div className="space-y-6">
                                {/* Success Header */}
                                <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-center mb-2">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                                        Certificate Verified
                                    </h3>
                                    <p className="text-green-700 text-sm">
                                        This certificate is authentic and valid
                                    </p>
                                </div>

                                {/* Certificate Details */}
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Award className="h-6 w-6 text-yellow-600" />
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            Certificate of Completion
                                        </h4>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                            {certificate.grade}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Student Name</div>
                                                    <div className="font-semibold text-gray-900">
                                                        {certificate.studentName}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <BookOpen className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Course Name</div>
                                                    <div className="font-semibold text-gray-900">
                                                        {certificate.courseName}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Completion Date</div>
                                                    <div className="font-semibold text-gray-900">
                                                        {certificate.completionDate}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <div className="text-sm text-gray-600">Certificate ID</div>
                                                    <div className="font-semibold text-gray-900 font-mono">
                                                        {certificate.certificateId}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {certificate.instructor && (
                                            <div className="pt-4 border-t border-yellow-200">
                                                <div className="text-sm text-gray-600 mb-1">Instructor</div>
                                                <div className="font-semibold text-gray-900">
                                                    {certificate.instructor.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Issue Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 mb-2">Certificate Information</div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Issue Date:</span>
                                            <span className="ml-2 font-medium">{certificate.issueDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Verification Code:</span>
                                            <span className="ml-2 font-mono font-medium">
                                                {certificate.verificationCode}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={downloadCertificate}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Download Certificate
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-xs text-gray-500 pt-4 border-t">
                                    This certificate has been verified as authentic and issued by the LMS platform.
                                    <br />
                                    For any questions about this certificate, please contact the issuing institution.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}