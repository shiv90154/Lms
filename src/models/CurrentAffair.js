import mongoose from 'mongoose';

const currentAffairSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['politics', 'economy', 'sports', 'science', 'technology', 'international', 'environment', 'social', 'defense', 'other']
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['daily', 'monthly'],
        required: true,
        default: 'daily'
    },
    isPremium: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (value) {
                // Monthly content should be premium
                return this.type !== 'monthly' || value === true;
            },
            message: 'Monthly content must be premium'
        }
    },
    tags: [{
        type: String,
        trim: true
    }],
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    imageUrl: {
        type: String
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    seoTitle: {
        type: String,
        trim: true
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date
    },
    scheduledFor: {
        type: Date
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        min: 2000,
        max: 2100
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
currentAffairSchema.index({ type: 1, isPremium: 1 });
currentAffairSchema.index({ category: 1, date: -1 });
currentAffairSchema.index({ date: -1 });
currentAffairSchema.index({ slug: 1 });
currentAffairSchema.index({ isActive: 1 });
currentAffairSchema.index({ viewCount: -1 });
currentAffairSchema.index({ tags: 1 });
currentAffairSchema.index({ month: 1, year: 1 });
currentAffairSchema.index({ publishedAt: -1 });
currentAffairSchema.index({ scheduledFor: 1 });

// Pre-save middleware to generate slug
currentAffairSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        const dateStr = this.date.toISOString().split('T')[0];
        this.slug = `${dateStr}-${this.title}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Pre-save middleware to auto-generate SEO fields
currentAffairSchema.pre('save', function (next) {
    if (!this.seoTitle || this.isModified('title')) {
        this.seoTitle = this.title.substring(0, 60);
    }

    if (!this.seoDescription || this.isModified('summary')) {
        this.seoDescription = this.summary.substring(0, 160);
    }

    next();
});

// Pre-save middleware to set month and year
currentAffairSchema.pre('save', function (next) {
    if (this.isModified('date') || this.isNew) {
        const date = new Date(this.date);
        this.month = date.getMonth() + 1; // JavaScript months are 0-indexed
        this.year = date.getFullYear();
    }
    next();
});

// Pre-save middleware to auto-categorize and tag
currentAffairSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('title') || this.isModified('content')) {
        const text = `${this.title} ${this.content}`.toLowerCase();
        const autoTags = [];

        // Common current affairs keywords
        const keywords = {
            'politics': ['election', 'parliament', 'government', 'minister', 'policy', 'bill', 'law'],
            'economy': ['gdp', 'inflation', 'budget', 'tax', 'economy', 'market', 'finance', 'rbi', 'bank'],
            'sports': ['cricket', 'football', 'olympics', 'medal', 'championship', 'tournament', 'player'],
            'science': ['research', 'discovery', 'scientist', 'study', 'experiment', 'innovation'],
            'technology': ['ai', 'technology', 'digital', 'software', 'app', 'internet', 'cyber'],
            'international': ['un', 'nato', 'treaty', 'summit', 'bilateral', 'foreign', 'global'],
            'environment': ['climate', 'pollution', 'environment', 'green', 'renewable', 'carbon'],
            'defense': ['army', 'navy', 'air force', 'defense', 'military', 'weapon', 'security']
        };

        // Auto-detect category based on keywords if not set
        if (!this.category || this.category === 'other') {
            for (const [cat, words] of Object.entries(keywords)) {
                if (words.some(word => text.includes(word))) {
                    this.category = cat;
                    break;
                }
            }
        }

        // Generate tags based on keywords
        Object.values(keywords).flat().forEach(keyword => {
            if (text.includes(keyword) && !this.tags.includes(keyword)) {
                autoTags.push(keyword);
            }
        });

        // Add category as tag
        if (!this.tags.includes(this.category)) {
            autoTags.push(this.category);
        }

        // Add month-year as tag for monthly content
        if (this.type === 'monthly') {
            const monthYear = `${this.month}-${this.year}`;
            if (!this.tags.includes(monthYear)) {
                autoTags.push(monthYear);
            }
        }

        // Merge auto-generated tags with existing tags (limit to 10 most relevant)
        this.tags = [...new Set([...this.tags, ...autoTags])].slice(0, 10);
    }
    next();
});

// Virtual for formatted date
currentAffairSchema.virtual('formattedDate').get(function () {
    return this.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for reading time (assuming 200 words per minute)
currentAffairSchema.virtual('readingTime').get(function () {
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes;
});

// Virtual for month name
currentAffairSchema.virtual('monthName').get(function () {
    if (!this.month) return '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[this.month - 1];
});

// Static method to find active content
currentAffairSchema.statics.findActiveContent = function (filters = {}) {
    return this.find({ ...filters, isActive: true })
        .populate('author', 'firstName lastName email')
        .sort({ date: -1 });
};

// Static method to find daily content
currentAffairSchema.statics.findDailyContent = function (filters = {}) {
    return this.find({ ...filters, type: 'daily', isActive: true })
        .sort({ date: -1 });
};

// Static method to find monthly content
currentAffairSchema.statics.findMonthlyContent = function (filters = {}) {
    return this.find({ ...filters, type: 'monthly', isPremium: true, isActive: true })
        .sort({ year: -1, month: -1 });
};

// Static method to find by category
currentAffairSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true })
        .sort({ date: -1 });
};

// Static method to find by date range
currentAffairSchema.statics.findByDateRange = function (startDate, endDate) {
    return this.find({
        date: { $gte: startDate, $lte: endDate },
        isActive: true
    }).sort({ date: -1 });
};

// Static method to find by month and year
currentAffairSchema.statics.findByMonthYear = function (month, year) {
    return this.find({
        month,
        year,
        isActive: true
    }).sort({ date: -1 });
};

// Static method to find scheduled content
currentAffairSchema.statics.findScheduledContent = function () {
    const now = new Date();
    return this.find({
        scheduledFor: { $lte: now },
        publishedAt: { $exists: false },
        isActive: true
    }).sort({ scheduledFor: 1 });
};

// Static method to search content
currentAffairSchema.statics.searchContent = function (searchTerm, filters = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    const query = {
        ...filters,
        isActive: true,
        $or: [
            { title: searchRegex },
            { summary: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } },
            { category: searchRegex }
        ]
    };
    return this.find(query).sort({ date: -1, viewCount: -1 });
};

// Static method to find by filters (category, month, year)
currentAffairSchema.statics.findByFilters = function (filters = {}) {
    const query = { isActive: true };

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.month) {
        query.month = filters.month;
    }

    if (filters.year) {
        query.year = filters.year;
    }

    if (filters.type) {
        query.type = filters.type;
    }

    if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
    }

    return this.find(query).sort({ date: -1 });
};

// Static method to get trending content (most viewed in last 7 days)
currentAffairSchema.statics.getTrendingContent = function (limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.find({
        date: { $gte: sevenDaysAgo },
        isActive: true
    })
        .sort({ viewCount: -1 })
        .limit(limit);
};

// Instance method to increment view count
currentAffairSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save();
};

// Instance method to publish content
currentAffairSchema.methods.publish = async function () {
    this.publishedAt = new Date();
    this.isActive = true;
    await this.save();
};

// Instance method to schedule content
currentAffairSchema.methods.schedule = async function (scheduledDate) {
    this.scheduledFor = scheduledDate;
    this.isActive = false;
    await this.save();
};

// Instance method to check if user has access
currentAffairSchema.methods.checkUserAccess = function (user) {
    // Daily content is free for all
    if (this.type === 'daily' && !this.isPremium) {
        return true;
    }

    // Premium/monthly content requires authentication and premium access
    if (this.isPremium || this.type === 'monthly') {
        // This would typically check against user's subscription status
        // For now, we'll return false and let the calling code handle the logic
        return false;
    }

    return true;
};

// Instance method to check if content is published
currentAffairSchema.methods.isPublished = function () {
    return this.publishedAt && this.isActive;
};

// Instance method to check if content is scheduled
currentAffairSchema.methods.isScheduled = function () {
    return this.scheduledFor && !this.publishedAt;
};

// Ensure virtual fields are serialized
currentAffairSchema.set('toJSON', {
    virtuals: true
});

const CurrentAffair = mongoose.models.CurrentAffair || mongoose.model('CurrentAffair', currentAffairSchema);

export default CurrentAffair;
