import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    studentName: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    completionDate: {
        type: Date,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    instructor: {
        name: String,
        signature: String // URL to signature image
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass'],
        default: 'Pass'
    },
    verificationCode: {
        type: String,
        required: true,
        unique: true
    },
    isValid: {
        type: Boolean,
        default: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    metadata: {
        totalLessons: Number,
        totalDuration: Number, // in minutes
        timeSpent: Number, // in minutes
        progressPercentage: Number
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ isValid: 1 });
certificateSchema.index({ issueDate: -1 });

// Pre-save middleware to generate certificate ID and verification code
certificateSchema.pre('save', function (next) {
    if (this.isNew) {
        // Generate certificate ID (format: CERT-YYYY-XXXXXX)
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        this.certificateId = `CERT-${year}-${randomNum}`;

        // Generate verification code (8-character alphanumeric)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let verificationCode = '';
        for (let i = 0; i < 8; i++) {
            verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.verificationCode = verificationCode;
    }
    next();
});

// Static method to find by certificate ID
certificateSchema.statics.findByCertificateId = function (certificateId) {
    return this.findOne({ certificateId, isValid: true })
        .populate('userId', 'firstName lastName email')
        .populate('courseId', 'title category level instructor');
};

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = function (verificationCode) {
    return this.findOne({ verificationCode, isValid: true })
        .populate('userId', 'firstName lastName email')
        .populate('courseId', 'title category level instructor');
};

// Static method to find user certificates
certificateSchema.statics.findByUser = function (userId) {
    return this.find({ userId, isValid: true })
        .populate('courseId', 'title thumbnail category level')
        .sort({ issueDate: -1 });
};

// Static method to find course certificates
certificateSchema.statics.findByCourse = function (courseId) {
    return this.find({ courseId, isValid: true })
        .populate('userId', 'firstName lastName email')
        .sort({ issueDate: -1 });
};

// Instance method to increment download count
certificateSchema.methods.incrementDownload = async function () {
    this.downloadCount += 1;
    await this.save();
};

// Instance method to revoke certificate
certificateSchema.methods.revoke = async function () {
    this.isValid = false;
    await this.save();
};

// Instance method to get certificate URL
certificateSchema.methods.getCertificateUrl = function () {
    return `/api/certificates/${this.certificateId}/download`;
};

// Instance method to get verification URL
certificateSchema.methods.getVerificationUrl = function () {
    return `/certificates/verify/${this.verificationCode}`;
};

// Virtual for formatted certificate ID
certificateSchema.virtual('formattedCertificateId').get(function () {
    return this.certificateId;
});

// Virtual for formatted issue date
certificateSchema.virtual('formattedIssueDate').get(function () {
    return this.issueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for formatted completion date
certificateSchema.virtual('formattedCompletionDate').get(function () {
    return this.completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Ensure virtual fields are serialized
certificateSchema.set('toJSON', {
    virtuals: true
});

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

export default Certificate;