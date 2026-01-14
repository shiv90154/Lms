'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Eye, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalOrders: 0,
        totalPages: 0,
        hasMore: false,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login?redirect=/orders');
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders?page=${page}&limit=10`);
            const data = await response.json();

            if (data.success) {
                setOrders(data.data.orders);
                setPagination(data.data.pagination);
            } else {
                setError(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800',
            processing: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            packed: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            out_for_delivery: 'bg-cyan-100 text-cyan-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            returned: 'bg-orange-100 text-orange-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        View and track your order history
                    </p>
                </div>
                <Button asChild>
                    <Link href="/books">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start shopping to see your orders here
                        </p>
                        <Button asChild>
                            <Link href="/books">Browse Books</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Order #{order.orderNumber}
                                        </CardTitle>
                                        <CardDescription>
                                            Placed on{' '}
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={getStatusColor(order.orderStatus)}>
                                            {formatStatus(order.orderStatus)}
                                        </Badge>
                                        <Badge className={getStatusColor(order.paymentStatus)}>
                                            {formatStatus(order.paymentStatus)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Order Items */}
                                    <div className="space-y-2">
                                        {order.items.slice(0, 2).map((item) => (
                                            <div key={item._id} className="flex gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-12 h-16 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">
                                                        ₹{item.totalPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-sm text-muted-foreground">
                                                +{order.items.length - 2} more item(s)
                                            </p>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Amount
                                            </p>
                                            <p className="text-xl font-bold">
                                                ₹{order.finalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                        <Button asChild>
                                            <Link href={`/orders/${order._id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => fetchOrders(pagination.page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!pagination.hasMore}
                        onClick={() => fetchOrders(pagination.page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
