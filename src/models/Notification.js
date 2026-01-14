import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'announcement'],
        default: 'info'
    },
    recipients: {
        type: String,
        enum: ['all', 'students', 'admins', 'specific'],
        default: 'all'
    },
    specificUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRead: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    sendEmail: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    expiresAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipients: 1 });
notificationSchema.index({ specificUsers: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isActive: 1 });
notificationSchema.index({ expiresAt: 1 });

// Static method to create notification for all users
notificationSchema.statics.createForAll = async function (data) {
    const notification = new this({
        ...data,
        recipients: 'all'
    });
    await notification.save();
    return notification;
};

// Static method to create notification for specific role
notificationSchema.statics.createForRole = async function (data, role) {
    const notification = new this({
        ...data,
        recipients: role
    });
    await notification.save();
    return notification;
};

// Static method to create notification for specific users
notificationSchema.statics.createForUsers = async function (data, userIds) {
    const notification = new this({
        ...data,
        recipients: 'specific',
        specificUsers: userIds
    });
    await notification.save();
    return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function (userId, userRole) {
    const query = {
        isActive: true,
        $or: [
            { recipients: 'all' },
            { recipients: userRole },
            { specificUsers: userId }
        ]
    };

    // Filter out expired notifications
    const now = new Date();
    query.$or.push({
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: now } }
        ]
    });

    return this.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ priority: -1, createdAt: -1 });
};

// Instance method to mark as read by user
notificationSchema.methods.markAsRead = async function (userId) {
    const alreadyRead = this.isRead.some(
        read => read.userId.toString() === userId.toString()
    );

    if (!alreadyRead) {
        this.isRead.push({
            userId,
            readAt: new Date()
        });
        await this.save();
    }

    return this;
};

// Instance method to check if read by user
notificationSchema.methods.isReadBy = function (userId) {
    return this.isRead.some(
        read => read.userId.toString() === userId.toString()
    );
};

// Instance method to get read count
notificationSchema.methods.getReadCount = function () {
    return this.isRead.length;
};

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', {
    virtuals: true
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
