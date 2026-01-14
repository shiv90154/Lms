import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['pdf', 'notes', 'previous_paper'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    examType: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        min: 1900,
        max: 2100
    },
    fileUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        min: 0,
        default: 0,
        validate: {
            validator: function (value) {
                return !this.isPaid || value > 0;
            },
            message: 'Paid materials must have a price greater than 0'
        }
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    fileSize: {
        type: Number, // in bytes
        min: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
studyMaterialSchema.index({ type: 1, category: 1 });
studyMaterialSchema.index({ examType: 1, year: -1 });
studyMaterialSchema.index({ tags: 1 });
studyMaterialSchema.index({ isActive: 1, isPaid: 1 });
studyMaterialSchema.index({ slug: 1 });
studyMaterialSchema.index({ downloadCount: -1 });

// Pre-save middleware to generate slug
studyMaterialSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Pre-save middleware to auto-categorize and tag
studyMaterialSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('title') || this.isModified('description')) {
        // Auto-generate tags from title and description
        const text = `${this.title} ${this.description}`.toLowerCase();
        const autoTags = [];

        // Common exam-related keywords
        const keywords = ['upsc', 'ssc', 'banking', 'railway', 'gate', 'neet', 'jee',
            'cat', 'gmat', 'ielts', 'toefl', 'gre', 'civil services'];

        keywords.forEach(keyword => {
            if (text.includes(keyword) && !this.tags.includes(keyword)) {
                autoTags.push(keyword);
            }
        });

        // Add year as tag if present
        if (this.year && !this.tags.includes(this.year.toString())) {
            autoTags.push(this.year.toString());
        }

        // Add type as tag
        if (!this.tags.includes(this.type)) {
            autoTags.push(this.type);
        }

        // Merge auto-generated tags with existing tags
        this.tags = [...new Set([...this.tags, ...autoTags])];
    }
    next();
});

// Virtual for file size in MB
studyMaterialSchema.virtual('fileSizeMB').get(function () {
    if (!this.fileSize) return 0;
    return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Static method to find active materials
studyMaterialSchema.statics.findActiveMaterials = function (filters = {}) {
    return this.find({ ...filters, isActive: true })
        .populate('uploadedBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

// Static method to find by type
studyMaterialSchema.statics.findByType = function (type) {
    return this.find({ type, isActive: true })
        .sort({ downloadCount: -1 });
};

// Static method to find by exam type
studyMaterialSchema.statics.findByExamType = function (examType) {
    return this.find({ examType, isActive: true })
        .sort({ year: -1, downloadCount: -1 });
};

// Static method to find free materials
studyMaterialSchema.statics.findFreeMaterials = function (filters = {}) {
    return this.find({ ...filters, isPaid: false, isActive: true })
        .sort({ downloadCount: -1 });
};

// Static method to find paid materials
studyMaterialSchema.statics.findPaidMaterials = function (filters = {}) {
    return this.find({ ...filters, isPaid: true, isActive: true })
        .sort({ price: 1 });
};

// Static method to search materials
studyMaterialSchema.statics.searchMaterials = function (searchTerm, filters = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    const query = {
        ...filters,
        isActive: true,
        $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } },
            { examType: searchRegex },
            { category: searchRegex }
        ]
    };
    return this.find(query).sort({ downloadCount: -1 });
};

// Static method to find by filters (exam, category, year)
studyMaterialSchema.statics.findByFilters = function (filters = {}) {
    const query = { isActive: true };

    if (filters.examType) {
        query.examType = filters.examType;
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.year) {
        query.year = filters.year;
    }

    if (filters.type) {
        query.type = filters.type;
    }

    if (filters.isPaid !== undefined) {
        query.isPaid = filters.isPaid;
    }

    return this.find(query).sort({ year: -1, downloadCount: -1 });
};

// Instance method to increment download count
studyMaterialSchema.methods.incrementDownloadCount = async function () {
    this.downloadCount += 1;
    await this.save();
};

// Instance method to check if user has access
studyMaterialSchema.methods.checkUserAccess = function (user) {
    // Free materials are accessible to all
    if (!this.isPaid) {
        return true;
    }

    // For paid materials, check if user has purchased
    // This would typically check against a Purchase model
    // For now, we'll return false and let the calling code handle the logic
    return false;
};

// Ensure virtual fields are serialized
studyMaterialSchema.set('toJSON', {
    virtuals: true
});

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;
