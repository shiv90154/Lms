import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    // Personal Information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },

    // Parent/Guardian Details
    parentDetails: {
        fatherName: {
            type: String,
            trim: true
        },
        motherName: {
            type: String,
            trim: true
        },
        guardianName: {
            type: String,
            trim: true
        },
        guardianPhone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        },
        guardianEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        }
    },

    // Address Information
    address: {
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        zipCode: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        country: {
            type: String,
            required: true,
            default: 'India',
            trim: true
        }
    },

    // Education Background
    education: {
        currentClass: {
            type: String,
            trim: true
        },
        schoolName: {
            type: String,
            trim: true
        },
        board: {
            type: String,
            trim: true
        },
        previousQualification: {
            type: String,
            trim: true
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100
        }
    },

    // Course/Program Interest
    interestedCourses: [{
        type: String,
        trim: true
    }],
    targetExam: {
        type: String,
        trim: true
    },
    preferredBatch: {
        type: String,
        trim: true
    },

    // Document Uploads
    documents: [{
        documentType: {
            type: String,
            enum: ['photo', 'id_proof', 'address_proof', 'marksheet', 'other'],
            required: true
        },
        documentUrl: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Enrollment Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'contacted'],
        default: 'pending'
    },

    // Lead Management
    leadSource: {
        type: String,
        enum: ['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'other'],
        default: 'website'
    },
    referredBy: {
        type: String,
        trim: true
    },

    // Follow-up tracking
    followUps: [{
        date: {
            type: Date,
            required: true
        },
        notes: {
            type: String,
            trim: true
        },
        contactedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        nextFollowUpDate: Date
    }],

    // Additional Notes
    remarks: {
        type: String,
        trim: true
    },
    adminNotes: {
        type: String,
        trim: true
    },

    // Linked User (if converted to registered user)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Timestamps
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date,
    approvedAt: Date
}, {
    timestamps: true
});

// Index for faster queries
enrollmentSchema.index({ email: 1 });
enrollmentSchema.index({ phone: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ submittedAt: -1 });

// Virtual for age calculation
enrollmentSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Static method to find by email
enrollmentSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by phone
enrollmentSchema.statics.findByPhone = function (phone) {
    return this.findOne({ phone });
};

// Static method to get pending enrollments
enrollmentSchema.statics.getPendingEnrollments = function () {
    return this.find({ status: 'pending' }).sort({ submittedAt: -1 });
};

// Instance method to add follow-up
enrollmentSchema.methods.addFollowUp = async function (followUpData) {
    this.followUps.push(followUpData);
    await this.save();
};

// Instance method to update status
enrollmentSchema.methods.updateStatus = async function (newStatus, adminNotes = '') {
    this.status = newStatus;
    if (adminNotes) {
        this.adminNotes = adminNotes;
    }

    if (newStatus === 'under_review') {
        this.reviewedAt = new Date();
    } else if (newStatus === 'approved') {
        this.approvedAt = new Date();
    }

    await this.save();
};

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', {
    virtuals: true
});

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
