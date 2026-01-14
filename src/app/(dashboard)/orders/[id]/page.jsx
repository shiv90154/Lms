'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Truck, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
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

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={() => router.push('/orders')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>
                </Button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
                        <p className="text-muted-foreground mt-1">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(order.orderStatus)}>
                            {formatStatus(order.orderStatus)}
                        </Badge>
                        <Badge className={getStatusColor(order.paymentStatus)}>
                            Payment: {formatStatus(order.paymentStatus)}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-20 h-28 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                by {item.author}
                                            </p>
                                            {item.isbn && (
                                                <p className="text-xs text-muted-foreground">
                                                    ISBN: {item.isbn}
                                                </p>
                                            )}
                                            <p className="text-sm mt-2">
                                                Qty: {item.quantity} × ₹{item.effectivePrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                ₹{item.totalPrice.toFixed(2)}
                                            </p>
                                            {item.totalSavings > 0 && (
                                                <p className="text-xs text-green-600">
                                                    Saved ₹{item.totalSavings.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
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

                    {/* Tracking Information */}
                    {order.trackingNumber && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Tracking Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tracking Number</span>
                                        <span className="font-medium">{order.trackingNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Courier Partner</span>
                                        <span className="font-medium">{order.courierPartner}</span>
                                    </div>
                                    {order.estimatedDeliveryDate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Estimated Delivery
                                            </span>
                                            <span className="font-medium">
                                                {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>
                                        {order.shippingCharges === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${order.shippingCharges.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (GST)</span>
                                    <span>₹{order.taxAmount.toFixed(2)}</span>
                                </div>
                                {order.totalSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Total Savings</span>
                                        <span>-₹{order.totalSavings.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{order.finalAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium capitalize">
                                        {order.paymentMethod}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Status</span>
                                    <Badge className={getStatusColor(order.paymentStatus)}>
                                        {formatStatus(order.paymentStatus)}
                                    </Badge>
                                </div>
                                {order.razorpayPaymentId && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment ID</span>
                                        <span className="font-mono text-xs">
                                            {order.razorpayPaymentId.slice(0, 20)}...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
