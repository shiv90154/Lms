import mongoose from 'mongoose';

const userAnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: Number,
        min: 0
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    marksAwarded: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    }
}, {
    _id: false
});

const sectionResultSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sectionTitle: {
        type: String,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    attemptedQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    skippedQuestions: {
        type: Number,
        default: 0
    },
    marksObtained: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    _id: false
});

const testAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true
    },
    answers: [userAnswerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    rank: {
        type: Number,
        min: 1
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    startedAt: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isAutoSubmitted: {
        type: Boolean,
        default: false
    },
    sectionResults: [sectionResultSchema],
    totalQuestions: {
        type: Number,
        required: true
    },
    attemptedQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    skippedQuestions: {
        type: Number,
        default: 0
    },
    accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Index for efficient queries
testAttemptSchema.index({ userId: 1, testId: 1 });
testAttemptSchema.index({ testId: 1, score: -1 });
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ isCompleted: 1 });

// Pre-save middleware to calculate statistics
testAttemptSchema.pre('save', function (next) {
    if (this.isModified('answers') || this.isNew) {
        // Calculate attempted, correct, wrong, and skipped
        this.attemptedQuestions = this.answers.filter(a => a.selectedAnswer !== undefined && a.selectedAnswer !== null).length;
        this.correctAnswers = this.answers.filter(a => a.isCorrect).length;
        this.wrongAnswers = this.answers.filter(a => !a.isCorrect && a.selectedAnswer !== undefined && a.selectedAnswer !== null).length;
        this.skippedQuestions = this.totalQuestions - this.attemptedQuestions;

        // Calculate accuracy
        if (this.attemptedQuestions > 0) {
            this.accuracy = (this.correctAnswers / this.attemptedQuestions) * 100;
        } else {
            this.accuracy = 0;
        }

        // Calculate percentage
        if (this.totalMarks > 0) {
            this.percentage = (this.score / this.totalMarks) * 100;
        } else {
            this.percentage = 0;
        }
    }
    next();
});

// Static method to find user attempts
testAttemptSchema.statics.findUserAttempts = function (userId, filters = {}) {
    return this.find({ userId, ...filters })
        .populate('testId', 'title description category examType')
        .sort({ createdAt: -1 });
};

// Static method to find test attempts
testAttemptSchema.statics.findTestAttempts = function (testId, filters = {}) {
    return this.find({ testId, ...filters })
        .populate('userId', 'firstName lastName email')
        .sort({ score: -1, timeSpent: 1 });
};

// Static method to calculate rankings for a test
testAttemptSchema.statics.calculateRankings = async function (testId) {
    const attempts = await this.find({ testId, isCompleted: true })
        .sort({ score: -1, timeSpent: 1 });

    let currentRank = 1;
    let previousScore = null;
    let previousTime = null;
    let sameRankCount = 0;

    for (let i = 0; i < attempts.length; i++) {
        const attempt = attempts[i];

        if (previousScore !== null && (attempt.score !== previousScore || attempt.timeSpent !== previousTime)) {
            currentRank += sameRankCount;
            sameRankCount = 1;
        } else {
            sameRankCount++;
        }

        attempt.rank = currentRank;
        attempt.totalAttempts = attempts.length;
        await attempt.save();

        previousScore = attempt.score;
        previousTime = attempt.timeSpent;
    }

    return attempts;
};

// Instance method to calculate score
testAttemptSchema.methods.calculateScore = async function (test) {
    let totalScore = 0;
    const sectionResults = [];

    for (const section of test.sections) {
        const sectionResult = {
            sectionId: section._id,
            sectionTitle: section.title,
            totalQuestions: section.questions.length,
            attemptedQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            skippedQuestions: 0,
            marksObtained: 0,
            totalMarks: 0,
            accuracy: 0
        };

        for (const question of section.questions) {
            sectionResult.totalMarks += question.marks;

            const userAnswer = this.answers.find(a => a.questionId.toString() === question._id.toString());

            if (userAnswer && userAnswer.selectedAnswer !== undefined && userAnswer.selectedAnswer !== null) {
                sectionResult.attemptedQuestions++;

                if (userAnswer.selectedAnswer === question.correctAnswer) {
                    userAnswer.isCorrect = true;
                    userAnswer.marksAwarded = question.marks;
                    sectionResult.correctAnswers++;
                    sectionResult.marksObtained += question.marks;
                    totalScore += question.marks;
                } else {
                    userAnswer.isCorrect = false;
                    userAnswer.marksAwarded = -test.negativeMarking;
                    sectionResult.wrongAnswers++;
                    sectionResult.marksObtained -= test.negativeMarking;
                    totalScore -= test.negativeMarking;
                }
            } else {
                sectionResult.skippedQuestions++;
            }
        }

        if (sectionResult.attemptedQuestions > 0) {
            sectionResult.accuracy = (sectionResult.correctAnswers / sectionResult.attemptedQuestions) * 100;
        }

        sectionResults.push(sectionResult);
    }

    this.score = Math.max(0, totalScore); // Ensure score doesn't go negative
    this.sectionResults = sectionResults;
    await this.save();

    return this.score;
};

// Instance method to submit test
testAttemptSchema.methods.submitTest = async function (isAutoSubmit = false) {
    this.submittedAt = new Date();
    this.isCompleted = true;
    this.isAutoSubmitted = isAutoSubmit;

    if (this.startedAt) {
        this.timeSpent = Math.floor((this.submittedAt - this.startedAt) / 1000);
    }

    await this.save();
};

// Ensure virtual fields are serialized
testAttemptSchema.set('toJSON', {
    virtuals: true
});

const TestAttempt = mongoose.models.TestAttempt || mongoose.model('TestAttempt', testAttemptSchema);

export default TestAttempt;
