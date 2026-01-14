import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    deviceInfo: {
        userAgent: String,
        ip: String,
        browser: String,
        os: String,
        device: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true
});

// Index for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 });

// Static method to create session
sessionSchema.statics.createSession = async function (userId, refreshToken, deviceInfo, expiresAt) {
    return this.create({
        userId,
        refreshToken,
        deviceInfo,
        expiresAt
    });
};

// Static method to find active sessions for user
sessionSchema.statics.findActiveSessionsForUser = function (userId) {
    return this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
};

// Static method to invalidate session
sessionSchema.statics.invalidateSession = async function (refreshToken) {
    return this.findOneAndUpdate(
        { refreshToken },
        { isActive: false },
        { new: true }
    );
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = async function () {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isActive: false }
        ]
    });
};

// Instance method to update activity
sessionSchema.methods.updateActivity = async function () {
    this.lastActivity = new Date();
    await this.save();
};

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;