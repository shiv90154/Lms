'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
    User, Mail, Phone, MapPin, GraduationCap,
    Calendar, FileText, ArrowLeft, CheckCircle, XCircle
} from 'lucide-react';

export default function EnrollmentDetailPage({ params }) {
    const router = useRouter();
    const { id } = params;

    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [followUpNote, setFollowUpNote] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchEnrollmentDetails();
    }, [id]);

    const fetchEnrollmentDetails = async () => {
        try {
            const response = await fetch(`/api/enrollment/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch enrollment details');
            }

            setEnrollment(data.data);
            setAdminNotes(data.data.adminNotes || '');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch(`/api/enrollment/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    adminNotes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            setEnrollment(data.data);
            alert('Status updated successfully');
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddFollowUp = async () => {
        if (!followUpNote.trim()) {
            alert('Please enter follow-up notes');
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch(`/api/enrollment/${id}/follow-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: new Date().toISOString(),
                    notes: followUpNote
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add follow-up');
            }

            setEnrollment(data.data);
            setFollowUpNote('');
            alert('Follow-up added successfully');
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
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
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12">
                        <Alert variant="destructive">
                            {error || 'Enrollment not found'}
                        </Alert>
                        <div className="mt-6 text-center">
                            <Button onClick={() => router.push('/admin/enrollments')}>
                                Back to Enrollments
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/enrollments')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Enrollments
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{enrollment.fullName}</h1>
                        <p className="text-gray-600">Enrollment ID: {enrollment._id}</p>
                    </div>
                    <Badge variant={enrollment.status === 'approved' ? 'success' : 'default'}>
                        {enrollment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-600">Email</Label>
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {enrollment.email}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-600">Phone</Label>
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {enrollment.phone}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-600">Date of Birth</Label>
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(enrollment.dateOfBirth).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-600">Gender</Label>
                                <p className="capitalize">{enrollment.gender}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{enrollment.address.addressLine1}</p>
                            {enrollment.address.addressLine2 && <p>{enrollment.address.addressLine2}</p>}
                            <p>
                                {enrollment.address.city}, {enrollment.address.state} - {enrollment.address.zipCode}
                            </p>
                            <p>{enrollment.address.country}</p>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    {enrollment.education && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Education Background
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollment.education.currentClass && (
                                    <div>
                                        <Label className="text-gray-600">Current Class</Label>
                                        <p>{enrollment.education.currentClass}</p>
                                    </div>
                                )}
                                {enrollment.education.schoolName && (
                                    <div>
                                        <Label className="text-gray-600">School</Label>
                                        <p>{enrollment.education.schoolName}</p>
                                    </div>
                                )}
                                {enrollment.education.board && (
                                    <div>
                                        <Label className="text-gray-600">Board</Label>
                                        <p>{enrollment.education.board}</p>
                                    </div>
                                )}
                                {enrollment.education.percentage && (
                                    <div>
                                        <Label className="text-gray-600">Percentage</Label>
                                        <p>{enrollment.education.percentage}%</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Parent Details */}
                    {enrollment.parentDetails && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Parent/Guardian Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollment.parentDetails.fatherName && (
                                    <div>
                                        <Label className="text-gray-600">Father's Name</Label>
                                        <p>{enrollment.parentDetails.fatherName}</p>
                                    </div>
                                )}
                                {enrollment.parentDetails.motherName && (
                                    <div>
                                        <Label className="text-gray-600">Mother's Name</Label>
                                        <p>{enrollment.parentDetails.motherName}</p>
                                    </div>
                                )}
                                {enrollment.parentDetails.guardianPhone && (
                                    <div>
                                        <Label className="text-gray-600">Guardian Phone</Label>
                                        <p>{enrollment.parentDetails.guardianPhone}</p>
                                    </div>
                                )}
                                {enrollment.parentDetails.guardianEmail && (
                                    <div>
                                        <Label className="text-gray-600">Guardian Email</Label>
                                        <p>{enrollment.parentDetails.guardianEmail}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents */}
                    {enrollment.documents && enrollment.documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Uploaded Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {enrollment.documents.map((doc, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium capitalize">
                                                    {doc.documentType.replace('_', ' ')}
                                                </p>
                                                <p className="text-sm text-gray-600">{doc.fileName}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(doc.documentUrl, '_blank')}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusUpdate('under_review')}
                                disabled={updating || enrollment.status === 'under_review'}
                            >
                                Mark Under Review
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => handleStatusUpdate('contacted')}
                                disabled={updating || enrollment.status === 'contacted'}
                            >
                                Mark as Contacted
                            </Button>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusUpdate('approved')}
                                disabled={updating || enrollment.status === 'approved'}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                className="w-full"
                                variant="destructive"
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={updating || enrollment.status === 'rejected'}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Course Interest */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Interest</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {enrollment.targetExam && (
                                <div>
                                    <Label className="text-gray-600">Target Exam</Label>
                                    <p>{enrollment.targetExam}</p>
                                </div>
                            )}
                            {enrollment.preferredBatch && (
                                <div>
                                    <Label className="text-gray-600">Preferred Batch</Label>
                                    <p>{enrollment.preferredBatch}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <textarea
                                className="w-full px-3 py-2 border rounded-md"
                                rows="4"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes..."
                            />
                            <Button
                                className="w-full"
                                onClick={() => handleStatusUpdate(enrollment.status)}
                                disabled={updating}
                            >
                                Save Notes
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Follow-up */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Follow-up</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <textarea
                                className="w-full px-3 py-2 border rounded-md"
                                rows="3"
                                value={followUpNote}
                                onChange={(e) => setFollowUpNote(e.target.value)}
                                placeholder="Add follow-up notes..."
                            />
                            <Button
                                className="w-full"
                                onClick={handleAddFollowUp}
                                disabled={updating}
                            >
                                Add Follow-up
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Follow-up History */}
                    {enrollment.followUps && enrollment.followUps.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Follow-up History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {enrollment.followUps.map((followUp, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                                            <p className="text-gray-600 text-xs mb-1">
                                                {new Date(followUp.date).toLocaleString('en-IN')}
                                            </p>
                                            <p>{followUp.notes}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
