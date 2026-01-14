import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import TestAttempt from '@/models/TestAttempt';
import Course from '@/models/Course';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request) {
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

        // Get date ranges for analytics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Student Analytics
        const totalStudents = await User.countDocuments({ role: 'student' });
        const newStudentsThisMonth = await User.countDocuments({
            role: 'student',
            createdAt: { $gte: startOfMonth }
        });
        const newStudentsLastMonth = await User.countDocuments({
            role: 'student',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        // Order Analytics
        const totalOrders = await Order.countDocuments();
        const ordersThisMonth = await Order.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const ordersLastMonth = await Order.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        // Revenue Analytics
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const revenueThisMonthResult = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const revenueThisMonth = revenueThisMonthResult.length > 0 ? revenueThisMonthResult[0].total : 0;

        const revenueLastMonthResult = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const revenueLastMonth = revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].total : 0;

        // Test Attempt Analytics
        const totalTestAttempts = await TestAttempt.countDocuments({ isCompleted: true });
        const testAttemptsThisMonth = await TestAttempt.countDocuments({
            isCompleted: true,
            createdAt: { $gte: startOfMonth }
        });
        const testAttemptsLastMonth = await TestAttempt.countDocuments({
            isCompleted: true,
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        // Course Analytics
        const totalCourses = await Course.countDocuments({ isActive: true });
        const totalEnrollments = await Course.aggregate([
            { $group: { _id: null, total: { $sum: '$enrollmentCount' } } }
        ]);
        const enrollmentCount = totalEnrollments.length > 0 ? totalEnrollments[0].total : 0;

        // Recent Orders
        const recentOrders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber totalAmount paymentStatus orderStatus createdAt');

        // Recent Test Attempts
        const recentTestAttempts = await TestAttempt.find({ isCompleted: true })
            .populate('userId', 'firstName lastName email')
            .populate('testId', 'title')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('score percentage rank submittedAt');

        // Calculate growth percentages
        const studentGrowth = newStudentsLastMonth > 0
            ? ((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100
            : newStudentsThisMonth > 0 ? 100 : 0;

        const orderGrowth = ordersLastMonth > 0
            ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
            : ordersThisMonth > 0 ? 100 : 0;

        const revenueGrowth = revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
            : revenueThisMonth > 0 ? 100 : 0;

        const testGrowth = testAttemptsLastMonth > 0
            ? ((testAttemptsThisMonth - testAttemptsLastMonth) / testAttemptsLastMonth) * 100
            : testAttemptsThisMonth > 0 ? 100 : 0;

        return NextResponse.json({
            success: true,
            data: {
                students: {
                    total: totalStudents,
                    thisMonth: newStudentsThisMonth,
                    growth: Math.round(studentGrowth * 10) / 10
                },
                orders: {
                    total: totalOrders,
                    thisMonth: ordersThisMonth,
                    growth: Math.round(orderGrowth * 10) / 10
                },
                revenue: {
                    total: totalRevenue,
                    thisMonth: revenueThisMonth,
                    growth: Math.round(revenueGrowth * 10) / 10
                },
                testAttempts: {
                    total: totalTestAttempts,
                    thisMonth: testAttemptsThisMonth,
                    growth: Math.round(testGrowth * 10) / 10
                },
                courses: {
                    total: totalCourses,
                    enrollments: enrollmentCount
                },
                recentOrders,
                recentTestAttempts
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard analytics' },
            { status: 500 }
        );
    }
}
