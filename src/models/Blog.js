import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        trim: true,
        maxlength: 500
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featuredImage: {
        type: String,
        trim: true
    },
    categories: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    viewCount: {
        type: Number,
        default: 0
    },
    // SEO fields
    seoTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    seoKeywords: [{
        type: String,
        trim: true
    }],
    // Related posts
    relatedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {
    timestamps: true
});

// Index for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ author: 1 });

// Generate slug from title before saving
blogSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    // Auto-generate SEO fields if not provided
    if (!this.seoTitle) {
        this.seoTitle = this.title.substring(0, 60);
    }

    if (!this.seoDescription && this.excerpt) {
        this.seoDescription = this.excerpt.substring(0, 160);
    }

    next();
});

// Static method to find published posts
blogSchema.statics.findPublished = function (options = {}) {
    const query = { status: 'published' };

    if (options.category) {
        query.categories = options.category;
    }

    if (options.tag) {
        query.tags = options.tag;
    }

    return this.find(query)
        .sort({ publishedAt: -1 })
        .populate('author', 'firstName lastName email');
};

// Static method to find by slug
blogSchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug, status: 'published' })
        .populate('author', 'firstName lastName email')
        .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt');
};

// Instance method to increment view count
blogSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save();
};

// Instance method to find related posts
blogSchema.methods.findRelatedPosts = async function (limit = 3) {
    // Find posts with similar tags or categories
    const relatedPosts = await this.constructor.find({
        _id: { $ne: this._id },
        status: 'published',
        $or: [
            { tags: { $in: this.tags } },
            { categories: { $in: this.categories } }
        ]
    })
        .limit(limit)
        .sort({ publishedAt: -1 })
        .select('title slug excerpt featuredImage publishedAt');

    return relatedPosts;
};

// Virtual for reading time (assuming 200 words per minute)
blogSchema.virtual('readingTime').get(function () {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        return ret;
    }
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
