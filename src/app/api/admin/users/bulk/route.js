import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/middleware/auth';

export async function POST(request) {
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
        const { operation, data } = body;

        if (!operation || !data) {
            return NextResponse.json(
                { error: 'Missing operation or data' },
                { status: 400 }
            );
        }

        let result = {};

        switch (operation) {
            case 'delete':
                // Bulk delete users
                if (!Array.isArray(data)) {
                    return NextResponse.json(
                        { error: 'Data must be an array of user IDs' },
                        { status: 400 }
                    );
                }

                // Prevent deleting the current admin
                const filteredIds = data.filter(id => id !== authResult.user.userId);

                const deleteResult = await User.deleteMany({
                    _id: { $in: filteredIds }
                });

                result = {
                    deletedCount: deleteResult.deletedCount,
                    message: `Successfully deleted ${deleteResult.deletedCount} user(s)`
                };
                break;

            case 'activate':
                // Bulk activate users
                if (!Array.isArray(data)) {
                    return NextResponse.json(
                        { error: 'Data must be an array of user IDs' },
                        { status: 400 }
                    );
                }

                const activateResult = await User.updateMany(
                    { _id: { $in: data } },
                    { $set: { isActive: true } }
                );

                result = {
                    modifiedCount: activateResult.modifiedCount,
                    message: `Successfully activated ${activateResult.modifiedCount} user(s)`
                };
                break;

            case 'deactivate':
                // Bulk deactivate users
                if (!Array.isArray(data)) {
                    return NextResponse.json(
                        { error: 'Data must be an array of user IDs' },
                        { status: 400 }
                    );
                }

                // Prevent deactivating the current admin
                const filteredDeactivateIds = data.filter(id => id !== authResult.user.userId);

                const deactivateResult = await User.updateMany(
                    { _id: { $in: filteredDeactivateIds } },
                    { $set: { isActive: false } }
                );

                result = {
                    modifiedCount: deactivateResult.modifiedCount,
                    message: `Successfully deactivated ${deactivateResult.modifiedCount} user(s)`
                };
                break;

            case 'import':
                // Bulk import users from CSV data
                if (!Array.isArray(data)) {
                    return NextResponse.json(
                        { error: 'Data must be an array of user objects' },
                        { status: 400 }
                    );
                }

                const importResults = {
                    success: [],
                    failed: []
                };

                for (const userData of data) {
                    try {
                        const { email, password, firstName, lastName, role, phone } = userData;

                        // Validate required fields
                        if (!email || !password || !firstName || !lastName) {
                            importResults.failed.push({
                                email: email || 'unknown',
                                error: 'Missing required fields'
                            });
                            continue;
                        }

                        // Check if user already exists
                        const existingUser = await User.findOne({ email: email.toLowerCase() });
                        if (existingUser) {
                            importResults.failed.push({
                                email,
                                error: 'User already exists'
                            });
                            continue;
                        }

                        // Create new user
                        const user = new User({
                            email: email.toLowerCase(),
                            password,
                            firstName,
                            lastName,
                            role: role || 'student',
                            phone,
                            isActive: true,
                            emailVerified: true
                        });

                        await user.save();
                        importResults.success.push({
                            email,
                            id: user._id
                        });
                    } catch (error) {
                        importResults.failed.push({
                            email: userData.email || 'unknown',
                            error: error.message
                        });
                    }
                }

                result = {
                    successCount: importResults.success.length,
                    failedCount: importResults.failed.length,
                    details: importResults,
                    message: `Imported ${importResults.success.length} user(s), ${importResults.failed.length} failed`
                };
                break;

            case 'changeRole':
                // Bulk change user roles
                if (!data.userIds || !data.newRole) {
                    return NextResponse.json(
                        { error: 'Missing userIds or newRole' },
                        { status: 400 }
                    );
                }

                const roleResult = await User.updateMany(
                    { _id: { $in: data.userIds } },
                    { $set: { role: data.newRole } }
                );

                result = {
                    modifiedCount: roleResult.modifiedCount,
                    message: `Successfully changed role for ${roleResult.modifiedCount} user(s)`
                };
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid operation' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Bulk operation error:', error);
        return NextResponse.json(
            { error: 'Failed to perform bulk operation' },
            { status: 500 }
        );
    }
}
