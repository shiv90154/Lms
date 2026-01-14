import mongoose from 'mongoose';
import { hashPassword } from '../lib/auth.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    profile: {
        avatar: String,
        dateOfBirth: Date,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        education: String,
        parentDetails: {
            fatherName: String,
            motherName: String,
            guardianPhone: String,
            guardianEmail: String
        }
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    purchasedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    testAttempts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestAttempt'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date,
        deviceInfo: String
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    const { comparePassword } = await import('../lib/auth.js');
    return comparePassword(candidatePassword, this.password);
};

// Instance method to generate tokens
userSchema.methods.generateTokens = function () {
    const { generateAccessToken, generateRefreshToken } = require('../lib/auth.js');

    const payload = {
        userId: this._id,
        email: this.email,
        role: this.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = async function (refreshToken, deviceInfo = '') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    this.refreshTokens.push({
        token: refreshToken,
        expiresAt,
        deviceInfo
    });

    // Keep only last 5 refresh tokens per user
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }

    await this.save();
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = async function (refreshToken) {
    this.refreshTokens = this.refreshTokens.filter(token => token.token !== refreshToken);
    await this.save();
};

// Instance method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = async function () {
    this.refreshTokens = [];
    await this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;