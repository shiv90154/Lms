import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { verifyToken } from '@/lib/auth';

// GET /api/certificates/[id]/download - Download certificate as PDF
export async function GET(request, { params }) {
    try {
        await connectDB();

        const certificateId = params.id;

        if (!certificateId) {
            return NextResponse.json(
                { error: 'Certificate ID is required' },
                { status: 400 }
            );
        }

        // For public verification, no auth required
        // For user downloads, auth is required
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        let userId = null;

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                userId = decoded.userId;
            }
        }

        const certificate = await Certificate.findByCertificateId(certificateId);

        if (!certificate) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        // If authenticated, check if user owns the certificate
        if (userId && certificate.userId.toString() !== userId) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Increment download count
        await certificate.incrementDownload();

        // Generate PDF certificate
        const pdfBuffer = await generateCertificatePDF(certificate);

        // Return PDF response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificate-${certificate.certificateId}.pdf"`,
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error('Error downloading certificate:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to generate PDF certificate
async function generateCertificatePDF(certificate) {
    // This is a simplified PDF generation
    // In production, you would use a library like puppeteer, jsPDF, or PDFKit

    const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Certificate of Completion</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    margin: 0;
                    padding: 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .certificate {
                    background: white;
                    padding: 60px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 800px;
                    width: 100%;
                    border: 8px solid #f8f9fa;
                    position: relative;
                }
                .certificate::before {
                    content: '';
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    border: 2px solid #667eea;
                    border-radius: 10px;
                }
                .header {
                    margin-bottom: 40px;
                }
                .title {
                    font-size: 48px;
                    color: #667eea;
                    margin-bottom: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                }
                .subtitle {
                    font-size: 24px;
                    color: #6c757d;
                    margin-bottom: 40px;
                }
                .recipient {
                    font-size: 36px;
                    color: #333;
                    margin: 30px 0;
                    font-weight: bold;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                    display: inline-block;
                }
                .course-name {
                    font-size: 28px;
                    color: #667eea;
                    margin: 30px 0;
                    font-style: italic;
                }
                .completion-text {
                    font-size: 18px;
                    color: #6c757d;
                    margin: 20px 0;
                    line-height: 1.6;
                }
                .details {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px solid #dee2e6;
                }
                .detail-item {
                    text-align: center;
                }
                .detail-label {
                    font-size: 14px;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .detail-value {
                    font-size: 16px;
                    color: #333;
                    font-weight: bold;
                    margin-top: 5px;
                }
                .signature-section {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                }
                .signature {
                    text-align: center;
                    border-top: 2px solid #333;
                    padding-top: 10px;
                    min-width: 200px;
                }
                .verification {
                    text-align: center;
                    margin-top: 30px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }
                .verification-code {
                    font-family: 'Courier New', monospace;
                    font-size: 16px;
                    font-weight: bold;
                    color: #667eea;
                    letter-spacing: 2px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <div class="title">Certificate</div>
                    <div class="subtitle">of Completion</div>
                </div>
                
                <div class="completion-text">
                    This is to certify that
                </div>
                
                <div class="recipient">
                    ${certificate.studentName}
                </div>
                
                <div class="completion-text">
                    has successfully completed the course
                </div>
                
                <div class="course-name">
                    "${certificate.courseName}"
                </div>
                
                <div class="completion-text">
                    demonstrating dedication to learning and professional development
                </div>
                
                <div class="details">
                    <div class="detail-item">
                        <div class="detail-label">Completion Date</div>
                        <div class="detail-value">${certificate.formattedCompletionDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Certificate ID</div>
                        <div class="detail-value">${certificate.certificateId}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Grade</div>
                        <div class="detail-value">${certificate.grade}</div>
                    </div>
                </div>
                
                <div class="signature-section">
                    <div class="signature">
                        <div style="margin-bottom: 40px;"></div>
                        <div>${certificate.instructor.name}</div>
                        <div style="font-size: 14px; color: #6c757d;">Instructor</div>
                    </div>
                    <div class="signature">
                        <div style="margin-bottom: 40px;"></div>
                        <div>LMS Administrator</div>
                        <div style="font-size: 14px; color: #6c757d;">Platform</div>
                    </div>
                </div>
                
                <div class="verification">
                    <div style="font-size: 14px; color: #6c757d; margin-bottom: 5px;">
                        Verification Code
                    </div>
                    <div class="verification-code">
                        ${certificate.verificationCode}
                    </div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                        Verify at: ${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${certificate.verificationCode}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // For now, return HTML as text (in production, convert to PDF using puppeteer)
    // This is a placeholder - you would use a proper PDF generation library
    return Buffer.from(certificateHTML, 'utf-8');
}