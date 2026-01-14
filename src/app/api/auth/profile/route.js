import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';

// GET /api/auth/profile - Get user profile
export async function GET(request) {
    try {
        await connectDB();

        const token = request.cookies.get('accessToken')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Access token required' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/auth/profile - Update user profile
export async function PUT(request) {
    try {
        await connectDB();

        const token = request.cookies.get('accessToken')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Access token required' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            firstName,
            lastName,
            phone,
            profile: {
                dateOfBirth,
                address,
                education,
                parentDetails
            } = {}
        } = body;

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update basic fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;

        // Update profile fields
        if (!user.profile) user.profile = {};

        if (dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);
        if (education !== undefined) user.profile.education = education;

        // Update address
        if (address) {
            if (!user.profile.address) user.profile.address = {};
            Object.assign(user.profile.address, address);
        }

        // Update parent details
        if (parentDetails) {
            if (!user.profile.parentDetails) user.profile.parentDetails = {};
            Object.assign(user.profile.parentDetails, parentDetails);
        }

        await user.save();

        // Return updated user without sensitive fields
        const updatedUser = await User.findById(user._id).select('-password -refreshTokens');

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}