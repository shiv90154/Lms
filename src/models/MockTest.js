import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        type: String,
        required: true,
        trim: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (value) {
                return value < this.options.length;
            },
            message: 'Correct answer index must be within options range'
        }
    },
    explanation: {
        type: String,
        trim: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    subject: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

const testSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number, // in minutes, optional per section
        min: 0
    },
    order: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

const mockTestSchema = new mongoose.Schema({
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
    duration: {
        type: Number, // in minutes
        required: true,
        min: 1
    },
    totalMarks: {
        type: Number,
        required: true,
        min: 0
    },
    negativeMarking: {
        type: Number,
        default: 0,
        min: 0
    },
    instructions: [{
        type: String,
        trim: true
    }],
    sections: [testSectionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        trim: true
    },
    examType: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'mixed'],
        default: 'mixed'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    attemptCount: {
        type: Number,
        default: 0
    },
    createdBy: {
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

// Index for efficient queries
mockTestSchema.index({ category: 1, examType: 1 });
mockTestSchema.index({ isActive: 1 });
mockTestSchema.index({ slug: 1 });
mockTestSchema.index({ difficulty: 1 });
mockTestSchema.index({ isPaid: 1 });

// Pre-save middleware to generate slug
mockTestSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Pre-save middleware to calculate total marks
mockTestSchema.pre('save', function (next) {
    let totalMarks = 0;

    this.sections.forEach(section => {
        section.questions.forEach(question => {
            totalMarks += question.marks;
        });
    });

    this.totalMarks = totalMarks;
    next();
});

// Virtual for total questions count
mockTestSchema.virtual('totalQuestions').get(function () {
    let count = 0;
    this.sections.forEach(section => {
        count += section.questions.length;
    });
    return count;
});

// Static method to find active tests
mockTestSchema.statics.findActiveTests = function (filters = {}) {
    return this.find({ ...filters, isActive: true })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

// Static method to find by category
mockTestSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true })
        .populate('createdBy', 'firstName lastName email')
        .sort({ attemptCount: -1 });
};

// Static method to find by exam type
mockTestSchema.statics.findByExamType = function (examType) {
    return this.find({ examType, isActive: true })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

// Instance method to get question by ID
mockTestSchema.methods.getQuestionById = function (questionId) {
    for (const section of this.sections) {
        const question = section.questions.id(questionId);
        if (question) {
            return question;
        }
    }
    return null;
};

// Instance method to get section by ID
mockTestSchema.methods.getSectionById = function (sectionId) {
    return this.sections.id(sectionId);
};

// Instance method to increment attempt count
mockTestSchema.methods.incrementAttemptCount = async function () {
    this.attemptCount += 1;
    await this.save();
};

// Ensure virtual fields are serialized
mockTestSchema.set('toJSON', {
    virtuals: true
});

const MockTest = mongoose.models.MockTest || mongoose.model('MockTest', mockTestSchema);

export default MockTest;
