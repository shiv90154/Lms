import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
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
    discountPrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function (value) {
                return !value || value < this.price;
            },
            message: 'Discount price must be less than original price'
        }
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    images: [{
        type: String,
        required: true
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publisher: {
        type: String,
        trim: true
    },
    publicationDate: {
        type: Date
    },
    pages: {
        type: Number,
        min: 1
    },
    language: {
        type: String,
        default: 'English',
        trim: true
    },
    weight: {
        type: Number, // in grams
        min: 0
    },
    dimensions: {
        length: Number, // in cm
        width: Number,  // in cm
        height: Number  // in cm
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    soldCount: {
        type: Number,
        default: 0,
        min: 0
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
bookSchema.index({ category: 1, subcategory: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ isNewArrival: 1 });
bookSchema.index({ slug: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ stock: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ soldCount: -1 });

// Pre-save middleware to generate slug
bookSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for effective price (considering discount)
bookSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.price;
});

// Virtual for discount percentage
bookSchema.virtual('discountPercentage').get(function () {
    if (!this.discountPrice) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function () {
    return this.isActive && this.stock > 0;
});

// Static method to find active books
bookSchema.statics.findActiveBooks = function (filters = {}) {
    return this.find({ ...filters, isActive: true })
        .sort({ createdAt: -1 });
};

// Static method to find by category
bookSchema.statics.findByCategory = function (category, subcategory = null) {
    const query = { category, isActive: true };
    if (subcategory) {
        query.subcategory = subcategory;
    }
    return this.find(query).sort({ soldCount: -1 });
};

// Static method to find new arrivals
bookSchema.statics.findNewArrivals = function (limit = 10) {
    return this.find({ isNewArrival: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to find by price range
bookSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
    return this.find({
        isActive: true,
        $or: [
            { discountPrice: { $gte: minPrice, $lte: maxPrice } },
            {
                discountPrice: { $exists: false },
                price: { $gte: minPrice, $lte: maxPrice }
            }
        ]
    }).sort({ price: 1 });
};

// Static method to search books
bookSchema.statics.searchBooks = function (searchTerm, filters = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    const query = {
        ...filters,
        isActive: true,
        $or: [
            { title: searchRegex },
            { author: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } }
        ]
    };
    return this.find(query).sort({ rating: -1, soldCount: -1 });
};

// Instance method to check stock availability
bookSchema.methods.checkStock = function (quantity = 1) {
    return this.stock >= quantity && this.isActive;
};

// Instance method to reduce stock
bookSchema.methods.reduceStock = async function (quantity = 1) {
    if (!this.checkStock(quantity)) {
        throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    this.soldCount += quantity;
    await this.save();
};

// Instance method to increase stock
bookSchema.methods.increaseStock = async function (quantity = 1) {
    this.stock += quantity;
    await this.save();
};

// Instance method to update rating
bookSchema.methods.updateRating = async function (newRating) {
    // This is a simplified rating update - in production you'd want to track all ratings
    const totalRating = (this.rating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.rating = totalRating / this.reviewCount;
    await this.save();
};

// Ensure virtual fields are serialized
bookSchema.set('toJSON', {
    virtuals: true
});

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export default Book;