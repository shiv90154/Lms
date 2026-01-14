'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Loader2, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderFailedPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retrying, setRetrying] = useState(false);

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

    const handleRetryPayment = async () => {
        setRetrying(true);
        // In a real implementation, you would create a new payment order
        // and redirect to checkout with the same order details
        setTimeout(() => {
            router.push('/checkout');
        }, 1000);
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
            {/* Failure Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <XCircle className="h-16 w-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
                <p className="text-muted-foreground">
                    We couldn't process your payment. Please try again.
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
                            <p className="font-medium capitalize text-red-600">
                                {order.paymentStatus}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Order Status</p>
                            <p className="font-medium capitalize">{order.orderStatus}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">₹{order.finalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Common Reasons Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Common Reasons for Payment Failure
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Insufficient balance in your account</li>
                        <li>• Incorrect card details or CVV</li>
                        <li>• Card expired or blocked</li>
                        <li>• Transaction limit exceeded</li>
                        <li>• Network or connectivity issues</li>
                        <li>• Bank declined the transaction</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={handleRetryPayment}
                    className="flex-1"
                    disabled={retrying}
                >
                    {retrying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Payment
                        </>
                    )}
                </Button>
                <Button asChild variant="outline" className="flex-1">
                    <Link href="/books">
                        <Home className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>

            {/* Help Message */}
            <Alert className="mt-6">
                <AlertDescription>
                    If you continue to face issues, please contact our support team or try using a
                    different payment method. Your order has been saved and you can complete the
                    payment later.
                </AlertDescription>
            </Alert>
        </div>
    );
}
