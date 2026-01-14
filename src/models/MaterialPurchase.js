import mongoose from 'mongoose';

const materialPurchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyMaterial',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastDownloadedAt: {
        type: Date
    },
    expiresAt: {
        type: Date // Optional: for time-limited access
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
materialPurchaseSchema.index({ userId: 1, materialId: 1 });
materialPurchaseSchema.index({ paymentStatus: 1 });
materialPurchaseSchema.index({ razorpayOrderId: 1 });

// Static method to check if user has purchased material
materialPurchaseSchema.statics.hasPurchased = async function (userId, materialId) {
    const purchase = await this.findOne({
        userId,
        materialId,
        paymentStatus: 'completed'
    });

    if (!purchase) {
        return false;
    }

    // Check if purchase has expired
    if (purchase.expiresAt && purchase.expiresAt < new Date()) {
        return false;
    }

    return true;
};

// Static method to get user's purchased materials
materialPurchaseSchema.statics.getUserPurchases = function (userId) {
    return this.find({
        userId,
        paymentStatus: 'completed'
    })
        .populate('materialId')
        .sort({ createdAt: -1 });
};

// Instance method to increment download count
materialPurchaseSchema.methods.incrementDownload = async function () {
    this.downloadCount += 1;
    this.lastDownloadedAt = new Date();
    await this.save();
};

const MaterialPurchase = mongoose.models.MaterialPurchase || mongoose.model('MaterialPurchase', materialPurchaseSchema);

export default MaterialPurchase;
