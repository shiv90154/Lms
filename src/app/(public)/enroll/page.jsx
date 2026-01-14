'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function EnrollPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',

        // Parent Details
        parentDetails: {
            fatherName: '',
            motherName: '',
            guardianName: '',
            guardianPhone: '',
            guardianEmail: '',
            relationship: ''
        },

        // Address
        address: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        },

        // Education
        education: {
            currentClass: '',
            schoolName: '',
            board: '',
            previousQualification: '',
            percentage: ''
        },

        // Course Interest
        interestedCourses: [],
        targetExam: '',
        preferredBatch: '',

        // Documents
        documents: [],

        // Additional
        leadSource: 'website',
        referredBy: '',
        remarks: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileUpload = async (e, documentType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);

            const response = await fetch('/api/enrollment/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            // Add document to form data
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, data.data]
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/enrollment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Enrollment submission failed');
            }

            // Redirect to success page
            router.push(`/enroll/success?id=${data.enrollmentId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Student Enrollment Form</CardTitle>
                    <CardDescription>
                        Fill in your details to enroll in our courses and programs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        placeholder="10-digit number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                    <Input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="gender">Gender *</Label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Parent/Guardian Details */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Parent/Guardian Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fatherName">Father's Name</Label>
                                    <Input
                                        id="fatherName"
                                        name="parentDetails.fatherName"
                                        value={formData.parentDetails.fatherName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="motherName">Mother's Name</Label>
                                    <Input
                                        id="motherName"
                                        name="parentDetails.motherName"
                                        value={formData.parentDetails.motherName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guardianPhone">Guardian Phone</Label>
                                    <Input
                                        id="guardianPhone"
                                        name="parentDetails.guardianPhone"
                                        type="tel"
                                        pattern="[0-9]{10}"
                                        value={formData.parentDetails.guardianPhone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="guardianEmail">Guardian Email</Label>
                                    <Input
                                        id="guardianEmail"
                                        name="parentDetails.guardianEmail"
                                        type="email"
                                        value={formData.parentDetails.guardianEmail}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Address Information</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                                    <Input
                                        id="addressLine1"
                                        name="address.addressLine1"
                                        value={formData.address.addressLine1}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addressLine2">Address Line 2</Label>
                                    <Input
                                        id="addressLine2"
                                        name="address.addressLine2"
                                        value={formData.address.addressLine2}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="zipCode">PIN Code *</Label>
                                        <Input
                                            id="zipCode"
                                            name="address.zipCode"
                                            pattern="[0-9]{6}"
                                            placeholder="6-digit PIN"
                                            value={formData.address.zipCode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Education Background */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Education Background</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="currentClass">Current Class/Standard</Label>
                                    <Input
                                        id="currentClass"
                                        name="education.currentClass"
                                        value={formData.education.currentClass}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="schoolName">School Name</Label>
                                    <Input
                                        id="schoolName"
                                        name="education.schoolName"
                                        value={formData.education.schoolName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="board">Board</Label>
                                    <Input
                                        id="board"
                                        name="education.board"
                                        placeholder="e.g., CBSE, ICSE, State Board"
                                        value={formData.education.board}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="percentage">Percentage/Grade</Label>
                                    <Input
                                        id="percentage"
                                        name="education.percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.education.percentage}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Course Interest */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Course Interest</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="targetExam">Target Exam</Label>
                                    <Input
                                        id="targetExam"
                                        name="targetExam"
                                        placeholder="e.g., JEE, NEET, UPSC"
                                        value={formData.targetExam}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="preferredBatch">Preferred Batch</Label>
                                    <Input
                                        id="preferredBatch"
                                        name="preferredBatch"
                                        placeholder="e.g., Morning, Evening"
                                        value={formData.preferredBatch}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Document Upload */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Document Upload (Optional)</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="photo">Passport Size Photo</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'photo')}
                                        disabled={uploadingDoc}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="idProof">ID Proof</Label>
                                    <Input
                                        id="idProof"
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileUpload(e, 'id_proof')}
                                        disabled={uploadingDoc}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="marksheet">Marksheet</Label>
                                    <Input
                                        id="marksheet"
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileUpload(e, 'marksheet')}
                                        disabled={uploadingDoc}
                                    />
                                </div>
                            </div>

                            {formData.documents.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Uploaded Documents: {formData.documents.length}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Additional Information</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="referredBy">Referred By (Optional)</Label>
                                    <Input
                                        id="referredBy"
                                        name="referredBy"
                                        value={formData.referredBy}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="remarks">Remarks/Questions (Optional)</Label>
                                    <textarea
                                        id="remarks"
                                        name="remarks"
                                        rows="4"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={loading || uploadingDoc}
                                className="px-8"
                            >
                                {loading ? 'Submitting...' : 'Submit Enrollment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
