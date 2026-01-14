'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Package, Truck, Download, Home } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && params.id) {
            fetchOrderDetails();
        }
    }, [user, authLoading, params.id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.data);
            } else {
                setError(data.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Fetch order error:', error);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={() => router.push('/orders')}>
                        View All Orders
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
                <p className="text-muted-foreground">
                    Thank you for your purchase. Your order has been confirmed.
                </p>
            </div>

            {/* Order Details Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Order #{order.orderNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Order Date</p>
                            <p className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Payment Status</p>
                            <p className="font-medium capitalize text-green-600">
                                {order.paymentStatus}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Order Status</p>
                            <p className="font-medium capitalize">{order.orderStatus}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Total Amount</p>
                            <p className="font-medium">₹{order.finalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold mb-3">Items Ordered</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item._id} className="flex gap-4">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            by {item.author}
                                        </p>
                                        <p className="text-sm">
                                            Qty: {item.quantity} × ₹{item.effectivePrice.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            ₹{item.totalPrice.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>
                                {order.shippingCharges === 0 ? (
                                    <span className="text-green-600">FREE</span>
                                ) : (
                                    `₹${order.shippingCharges.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (GST)</span>
                            <span>₹{order.taxAmount.toFixed(2)}</span>
                        </div>
                        {order.totalSavings > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Total Savings</span>
                                <span>-₹{order.totalSavings.toFixed(2)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Paid</span>
                            <span>₹{order.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        {order.shippingAddress.landmark && (
                            <p>Landmark: {order.shippingAddress.landmark}</p>
                        )}
                        <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                            {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
                        <p>Email: {order.shippingAddress.email}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                    <Link href={`/orders/${order._id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        View Order Details
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                    <Link href="/books">
                        <Home className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>

            {/* Confirmation Message */}
            <Alert className="mt-6">
                <AlertDescription>
                    A confirmation email has been sent to {order.shippingAddress.email}. You can
                    track your order status from your orders page.
                </AlertDescription>
            </Alert>
        </div>
    );
}
