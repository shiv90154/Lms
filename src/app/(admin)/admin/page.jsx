'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    ShoppingCart,
    DollarSign,
    FileText,
    TrendingUp,
    TrendingDown,
    BookOpen,
    GraduationCap
} from 'lucide-react';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch analytics');
            }

            setAnalytics(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-500',
            pending: 'bg-yellow-500',
            failed: 'bg-red-500',
            processing: 'bg-blue-500',
            confirmed: 'bg-green-500',
            shipped: 'bg-purple-500',
            delivered: 'bg-green-600',
            cancelled: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error: {error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your platform analytics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Students Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.students.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.students.thisMonth || 0} new this month
                        </p>
                        <div className="flex items-center mt-2">
                            {analytics?.students.growth >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${analytics?.students.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(analytics?.students.growth || 0)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.orders.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.orders.thisMonth || 0} this month
                        </p>
                        <div className="flex items-center mt-2">
                            {analytics?.orders.growth >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${analytics?.orders.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(analytics?.orders.growth || 0)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analytics?.revenue.total || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(analytics?.revenue.thisMonth || 0)} this month
                        </p>
                        <div className="flex items-center mt-2">
                            {analytics?.revenue.growth >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${analytics?.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(analytics?.revenue.growth || 0)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Attempts Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Test Attempts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.testAttempts.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.testAttempts.thisMonth || 0} this month
                        </p>
                        <div className="flex items-center mt-2">
                            {analytics?.testAttempts.growth >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${analytics?.testAttempts.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(analytics?.testAttempts.growth || 0)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-2" />
                            Course Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active Courses</span>
                                <span className="text-lg font-semibold">{analytics?.courses.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Enrollments</span>
                                <span className="text-lg font-semibold">{analytics?.courses.enrollments || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Avg. Enrollments per Course</span>
                                <span className="text-lg font-semibold">
                                    {analytics?.courses.total > 0
                                        ? Math.round(analytics.courses.enrollments / analytics.courses.total)
                                        : 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Avg. Order Value</span>
                                <span className="text-lg font-semibold">
                                    {analytics?.orders.total > 0
                                        ? formatCurrency(analytics.revenue.total / analytics.orders.total)
                                        : formatCurrency(0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Avg. Tests per Student</span>
                                <span className="text-lg font-semibold">
                                    {analytics?.students.total > 0
                                        ? (analytics.testAttempts.total / analytics.students.total).toFixed(1)
                                        : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Revenue per Student</span>
                                <span className="text-lg font-semibold">
                                    {analytics?.students.total > 0
                                        ? formatCurrency(analytics.revenue.total / analytics.students.total)
                                        : formatCurrency(0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest 5 orders placed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics?.recentOrders?.length > 0 ? (
                                analytics.recentOrders.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{order.orderNumber}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.user?.firstName} {order.user?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">{formatCurrency(order.totalAmount)}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="outline" className={`text-xs ${getStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Test Attempts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Test Attempts</CardTitle>
                        <CardDescription>Latest 5 completed tests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics?.recentTestAttempts?.length > 0 ? (
                                analytics.recentTestAttempts.map((attempt) => (
                                    <div key={attempt._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{attempt.testId?.title || 'Unknown Test'}</p>
                                            <p className="text-xs text-gray-500">
                                                {attempt.userId?.firstName} {attempt.userId?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">{formatDate(attempt.submittedAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">{attempt.score} marks</p>
                                            <p className="text-xs text-gray-500">{attempt.percentage.toFixed(1)}%</p>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                Rank #{attempt.rank}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent test attempts</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
