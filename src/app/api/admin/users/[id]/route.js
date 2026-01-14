import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findById(params.id)
            .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
            .populate('enrolledCourses', 'title price thumbnail')
            .populate('purchasedBooks', 'title author price')
            .populate('testAttempts', 'testId score percentage rank submittedAt');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const { firstName, lastName, phone, role, isActive, emailVerified, profile } = body;

        const user = await User.findById(params.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (emailVerified !== undefined) user.emailVerified = emailVerified;
        if (profile !== undefined) {
            user.profile = { ...user.profile, ...profile };
        }

        await user.save();

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isActive: user.isActive,
                    emailVerified: user.emailVerified
                }
            },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        // Verify authentication and admin role
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        // Prevent admin from deleting themselves
        if (params.id === authResult.user.userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndDelete(params.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
