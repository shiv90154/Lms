import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
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
    completedLessons: [{
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        timeSpent: {
            type: Number, // in minutes
            default: 0
        }
    }],
    currentLesson: {
        moduleId: mongoose.Schema.Types.ObjectId,
        chapterId: mongoose.Schema.Types.ObjectId,
        lessonId: mongoose.Schema.Types.ObjectId
    },
    progressPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    timeSpent: {
        type: Number, // total time spent in minutes
        default: 0
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateIssuedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ userId: 1 });
courseProgressSchema.index({ courseId: 1 });
courseProgressSchema.index({ progressPercentage: 1 });
courseProgressSchema.index({ completedAt: 1 });

// Pre-save middleware to calculate progress percentage
courseProgressSchema.pre('save', async function (next) {
    if (this.isModified('completedLessons')) {
        try {
            // Get the course to calculate total lessons
            const Course = mongoose.model('Course');
            const course = await Course.findById(this.courseId);

            if (course) {
                const totalLessons = course.totalLessons;
                const completedLessonsCount = this.completedLessons.length;
                const previousProgress = this.progressPercentage;

                this.progressPercentage = totalLessons > 0
                    ? Math.round((completedLessonsCount / totalLessons) * 100)
                    : 0;

                // Check if course is completed
                if (this.progressPercentage === 100 && !this.completedAt) {
                    this.completedAt = new Date();
                }

                // Auto-generate certificate when course is completed
                if (this.progressPercentage === 100 && previousProgress < 100 && !this.certificateIssued) {
                    // Set a flag to generate certificate after save
                    this._shouldGenerateCertificate = true;
                }
            }
        } catch (error) {
            console.error('Error calculating progress:', error);
        }
    }

    // Update last accessed time
    this.lastAccessedAt = new Date();
    next();
});

// Post-save middleware to handle certificate generation
courseProgressSchema.post('save', async function (doc) {
    if (doc._shouldGenerateCertificate) {
        try {
            // Import Certificate model dynamically to avoid circular dependency
            const Certificate = mongoose.model('Certificate');
            const User = mongoose.model('User');
            const Course = mongoose.model('Course');

            // Check if certificate already exists
            const existingCertificate = await Certificate.findOne({
                userId: doc.userId,
                courseId: doc.courseId
            });

            if (!existingCertificate) {
                // Get user and course details
                const [user, course] = await Promise.all([
                    User.findById(doc.userId),
                    Course.findById(doc.courseId).populate('instructor', 'firstName lastName')
                ]);

                if (user && course) {
                    // Create certificate
                    const certificate = new Certificate({
                        userId: doc.userId,
                        courseId: doc.courseId,
                        studentName: user.fullName,
                        courseName: course.title,
                        completionDate: doc.completedAt || new Date(),
                        instructor: {
                            name: course.instructor ? course.instructor.fullName : 'LMS Instructor',
                            signature: null
                        },
                        metadata: {
                            totalLessons: course.totalLessons,
                            totalDuration: course.totalDuration,
                            timeSpent: doc.timeSpent,
                            progressPercentage: doc.progressPercentage
                        }
                    });

                    await certificate.save();

                    // Update progress to mark certificate as issued
                    doc.certificateIssued = true;
                    doc.certificateIssuedAt = new Date();
                    await doc.save();

                    console.log(`Certificate auto-generated for user ${doc.userId} and course ${doc.courseId}`);
                }
            }
        } catch (error) {
            console.error('Error auto-generating certificate:', error);
        }
    }
});

// Static method to find progress by user
courseProgressSchema.statics.findByUser = function (userId) {
    return this.find({ userId })
        .populate('courseId', 'title thumbnail category level price')
        .sort({ lastAccessedAt: -1 });
};

// Static method to find progress by course
courseProgressSchema.statics.findByCourse = function (courseId) {
    return this.find({ courseId })
        .populate('userId', 'firstName lastName email')
        .sort({ progressPercentage: -1 });
};

// Static method to get user's progress for a specific course
courseProgressSchema.statics.getUserCourseProgress = function (userId, courseId) {
    return this.findOne({ userId, courseId })
        .populate('courseId', 'title thumbnail category level price totalLessons');
};

// Static method to get completed courses for user
courseProgressSchema.statics.getCompletedCourses = function (userId) {
    return this.find({
        userId,
        progressPercentage: 100,
        completedAt: { $exists: true }
    })
        .populate('courseId', 'title thumbnail category level')
        .sort({ completedAt: -1 });
};

// Static method to get in-progress courses for user
courseProgressSchema.statics.getInProgressCourses = function (userId) {
    return this.find({
        userId,
        progressPercentage: { $gt: 0, $lt: 100 }
    })
        .populate('courseId', 'title thumbnail category level')
        .sort({ lastAccessedAt: -1 });
};

// Instance method to mark lesson as completed
courseProgressSchema.methods.markLessonCompleted = async function (lessonId, timeSpent = 0) {
    // Check if lesson is already completed
    const existingCompletion = this.completedLessons.find(
        completion => completion.lessonId.toString() === lessonId.toString()
    );

    if (!existingCompletion) {
        this.completedLessons.push({
            lessonId,
            timeSpent,
            completedAt: new Date()
        });

        this.timeSpent += timeSpent;
        await this.save();
    }

    return this;
};

// Instance method to update current lesson
courseProgressSchema.methods.updateCurrentLesson = async function (moduleId, chapterId, lessonId) {
    this.currentLesson = {
        moduleId,
        chapterId,
        lessonId
    };

    await this.save();
    return this;
};

// Instance method to check if lesson is completed
courseProgressSchema.methods.isLessonCompleted = function (lessonId) {
    return this.completedLessons.some(
        completion => completion.lessonId.toString() === lessonId.toString()
    );
};

// Instance method to get completion percentage for a module
courseProgressSchema.methods.getModuleProgress = async function (moduleId) {
    try {
        const Course = mongoose.model('Course');
        const course = await Course.findById(this.courseId);

        if (!course) return 0;

        const module = course.getModuleById(moduleId);
        if (!module) return 0;

        let totalLessons = 0;
        let completedLessons = 0;

        module.chapters.forEach(chapter => {
            chapter.lessons.forEach(lesson => {
                totalLessons++;
                if (this.isLessonCompleted(lesson._id)) {
                    completedLessons++;
                }
            });
        });

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    } catch (error) {
        console.error('Error calculating module progress:', error);
        return 0;
    }
};

// Instance method to issue certificate
courseProgressSchema.methods.issueCertificate = async function () {
    if (this.progressPercentage === 100 && !this.certificateIssued) {
        this.certificateIssued = true;
        this.certificateIssuedAt = new Date();
        await this.save();
    }
    return this;
};

// Virtual for days since enrollment
courseProgressSchema.virtual('daysSinceEnrollment').get(function () {
    const now = new Date();
    const enrolled = this.enrolledAt;
    const diffTime = Math.abs(now - enrolled);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for estimated completion time (based on current progress rate)
courseProgressSchema.virtual('estimatedCompletionDays').get(function () {
    if (this.progressPercentage === 0) return null;

    const daysSinceEnrollment = this.daysSinceEnrollment;
    const progressRate = this.progressPercentage / daysSinceEnrollment;
    const remainingProgress = 100 - this.progressPercentage;

    return progressRate > 0 ? Math.ceil(remainingProgress / progressRate) : null;
});

// Ensure virtual fields are serialized
courseProgressSchema.set('toJSON', {
    virtuals: true
});

const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);

export default CourseProgress;