import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

// GET /api/certificates/verify/[code] - Verify certificate by verification code
export async function GET(request, { params }) {
    try {
        await connectDB();

        const verificationCode = params.code;

        if (!verificationCode) {
            return NextResponse.json(
                { error: 'Verification code is required' },
                { status: 400 }
            );
        }

        const certificate = await Certificate.verifyCertificate(verificationCode);

        if (!certificate) {
            return NextResponse.json(
                { error: 'Certificate not found or invalid' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                isValid: true,
                certificate: {
                    certificateId: certificate.certificateId,
                    studentName: certificate.studentName,
                    courseName: certificate.courseName,
                    completionDate: certificate.formattedCompletionDate,
                    issueDate: certificate.formattedIssueDate,
                    instructor: certificate.instructor,
                    grade: certificate.grade,
                    verificationCode: certificate.verificationCode
                }
            },
            message: 'Certificate is valid'
        });

    } catch (error) {
        console.error('Error verifying certificate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}