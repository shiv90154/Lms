import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    isbn: {
        type: String,
        trim: true
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

// Virtual for effective price per item
orderItemSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.price;
});

// Virtual for total savings for this item
orderItemSchema.virtual('totalSavings').get(function () {
    if (!this.discountPrice) return 0;
    return (this.price - this.discountPrice) * this.quantity;
});

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
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
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: 'India'
    },
    landmark: {
        type: String,
        trim: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    totalSavings: {
        type: Number,
        default: 0,
        min: 0
    },
    itemCount: {
        type: Number,
        required: true,
        min: 1
    },
    shippingAddress: {
        type: addressSchema,
        required: true
    },
    billingAddress: {
        type: addressSchema
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        default: 'processing'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod', 'wallet'],
        default: 'razorpay'
    },
    // Razorpay specific fields
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    // Shipping details
    shippingCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // Tracking information
    trackingNumber: {
        type: String,
        trim: true
    },
    courierPartner: {
        type: String,
        trim: true
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    // Order timeline
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            trim: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    // Notes and special instructions
    orderNotes: {
        type: String,
        trim: true
    },
    adminNotes: {
        type: String,
        trim: true
    },
    // Cancellation/Return details
    cancellationReason: {
        type: String,
        trim: true
    },
    refundAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    refundStatus: {
        type: String,
        enum: ['none', 'initiated', 'processed', 'completed', 'failed'],
        default: 'none'
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `ORD${timestamp}${random}`;
    }
    next();
});

// Pre-save middleware to calculate final amount
orderSchema.pre('save', function (next) {
    this.finalAmount = this.totalAmount + this.shippingCharges + this.taxAmount - this.discountAmount;
    next();
});

// Pre-save middleware to add status history
orderSchema.pre('save', function (next) {
    if (this.isModified('orderStatus') && !this.isNew) {
        this.statusHistory.push({
            status: this.orderStatus,
            timestamp: new Date()
        });
    }
    next();
});

// Static method to generate order from cart
orderSchema.statics.createFromCart = async function (userId, cartItems, shippingAddress, paymentDetails) {
    const orderItems = cartItems.map(item => ({
        book: item.book._id,
        title: item.book.title,
        author: item.book.author,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        totalPrice: (item.discountPrice || item.price) * item.quantity,
        isbn: item.book.isbn,
        image: item.book.images[0]
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalSavings = orderItems.reduce((sum, item) => {
        if (item.discountPrice) {
            return sum + ((item.price - item.discountPrice) * item.quantity);
        }
        return sum;
    }, 0);
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const order = new this({
        user: userId,
        items: orderItems,
        totalAmount,
        totalSavings,
        itemCount,
        shippingAddress,
        razorpayOrderId: paymentDetails.razorpayOrderId,
        statusHistory: [{
            status: 'processing',
            timestamp: new Date()
        }]
    });

    return order;
};

// Static method to find orders by user
orderSchema.statics.findByUser = function (userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const query = { user: userId };

    if (status) {
        query.orderStatus = status;
    }

    return this.find(query)
        .populate('items.book', 'title author images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

// Static method to find by order number
orderSchema.statics.findByOrderNumber = function (orderNumber) {
    return this.findOne({ orderNumber })
        .populate('user', 'firstName lastName email phone')
        .populate('items.book', 'title author images isbn');
};

// Static method to find by payment ID
orderSchema.statics.findByPaymentId = function (paymentId) {
    return this.findOne({ razorpayPaymentId: paymentId })
        .populate('user', 'firstName lastName email phone');
};

// Instance method to update payment status
orderSchema.methods.updatePaymentStatus = async function (status, paymentId = null, signature = null) {
    this.paymentStatus = status;
    if (paymentId) this.razorpayPaymentId = paymentId;
    if (signature) this.razorpaySignature = signature;

    if (status === 'completed') {
        this.orderStatus = 'confirmed';
    } else if (status === 'failed') {
        this.orderStatus = 'cancelled';
        this.cancellationReason = 'Payment failed';
    }

    await this.save();
    return this;
};

// Instance method to update order status
orderSchema.methods.updateOrderStatus = async function (status, note = '', updatedBy = null) {
    this.orderStatus = status;

    this.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy
    });

    await this.save();
    return this;
};

// Instance method to add tracking information
orderSchema.methods.addTrackingInfo = async function (trackingNumber, courierPartner, estimatedDeliveryDate = null) {
    this.trackingNumber = trackingNumber;
    this.courierPartner = courierPartner;
    if (estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    await this.save();
    return this;
};

// Instance method to process refund
orderSchema.methods.processRefund = async function (amount, reason = '') {
    this.refundAmount = amount;
    this.refundStatus = 'initiated';
    this.cancellationReason = reason;
    this.orderStatus = 'cancelled';

    await this.save();
    return this;
};

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
    const cancellableStatuses = ['processing', 'confirmed', 'packed'];
    return cancellableStatuses.includes(this.orderStatus) && this.paymentStatus !== 'refunded';
};

// Instance method to check if order can be returned
orderSchema.methods.canBeReturned = function () {
    const returnableStatuses = ['delivered'];
    const daysSinceDelivery = this.actualDeliveryDate ?
        Math.floor((Date.now() - this.actualDeliveryDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return returnableStatuses.includes(this.orderStatus) && daysSinceDelivery <= 7; // 7 days return policy
};

// Ensure virtual fields are serialized
orderItemSchema.set('toJSON', {
    virtuals: true
});

orderSchema.set('toJSON', {
    virtuals: true
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;