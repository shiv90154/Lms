import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['video', 'pdf', 'text'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        min: 0
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    lessons: [lessonSchema],
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    chapters: [chapterSchema],
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const courseSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    modules: [moduleSchema],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalDuration: {
        type: Number, // in minutes
        default: 0
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
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ price: 1 });

// Pre-save middleware to generate slug
courseSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Pre-save middleware to calculate total duration
courseSchema.pre('save', function (next) {
    let totalDuration = 0;

    this.modules.forEach(module => {
        module.chapters.forEach(chapter => {
            chapter.lessons.forEach(lesson => {
                if (lesson.duration) {
                    totalDuration += lesson.duration;
                }
            });
        });
    });

    this.totalDuration = totalDuration;
    next();
});

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function () {
    let count = 0;
    this.modules.forEach(module => {
        module.chapters.forEach(chapter => {
            count += chapter.lessons.length;
        });
    });
    return count;
});

// Virtual for total chapters count
courseSchema.virtual('totalChapters').get(function () {
    let count = 0;
    this.modules.forEach(module => {
        count += module.chapters.length;
    });
    return count;
});

// Static method to find active courses
courseSchema.statics.findActiveCourses = function (filters = {}) {
    return this.find({ ...filters, isActive: true })
        .populate('instructor', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

// Static method to find by category
courseSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true })
        .populate('instructor', 'firstName lastName email')
        .sort({ enrollmentCount: -1 });
};

// Static method to find by level
courseSchema.statics.findByLevel = function (level) {
    return this.find({ level, isActive: true })
        .populate('instructor', 'firstName lastName email')
        .sort({ rating: -1 });
};

// Instance method to get lesson by ID
courseSchema.methods.getLessonById = function (lessonId) {
    for (const module of this.modules) {
        for (const chapter of module.chapters) {
            const lesson = chapter.lessons.id(lessonId);
            if (lesson) {
                return lesson;
            }
        }
    }
    return null;
};

// Instance method to get chapter by ID
courseSchema.methods.getChapterById = function (chapterId) {
    for (const module of this.modules) {
        const chapter = module.chapters.id(chapterId);
        if (chapter) {
            return chapter;
        }
    }
    return null;
};

// Instance method to get module by ID
courseSchema.methods.getModuleById = function (moduleId) {
    return this.modules.id(moduleId);
};

// Instance method to increment enrollment
courseSchema.methods.incrementEnrollment = async function () {
    this.enrollmentCount += 1;
    await this.save();
};

// Instance method to update rating
courseSchema.methods.updateRating = async function (newRating) {
    // This is a simplified rating update - in production you'd want to track all ratings
    this.rating = newRating;
    await this.save();
};

// Ensure virtual fields are serialized
courseSchema.set('toJSON', {
    virtuals: true
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;