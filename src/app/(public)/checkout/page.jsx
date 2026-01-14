'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingBag, Truck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { cart, loading: cartLoading, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        landmark: '',
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [user, authLoading, router]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartLoading && (!cart || cart.items.length === 0)) {
            router.push('/cart');
        }
    }, [cart, cartLoading, router]);

    // Pre-fill user details
    useEffect(() => {
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const required = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'zipCode'];
        for (const field of required) {
            if (!shippingAddress[field] || shippingAddress[field].trim() === '') {
                setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingAddress.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Validate phone
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(shippingAddress.phone.replace(/\s/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }

            // Create payment order
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shippingAddress,
                    billingAddress: shippingAddress, // Use same address for billing
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to create order');
            }

            // Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
                amount: data.data.amount * 100, // Amount in paise
                currency: data.data.currency,
                name: process.env.NEXT_PUBLIC_APP_NAME || 'Premium LMS',
                description: `Order #${data.data.orderNumber}`,
                order_id: data.data.razorpayOrderId,
                prefill: {
                    name: shippingAddress.fullName,
                    email: shippingAddress.email,
                    contact: shippingAddress.phone,
                },
                theme: {
                    color: '#3b82f6',
                },
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            // Clear cart and redirect to success page
                            await clearCart();
                            router.push(`/orders/${verifyData.data.orderId}/success`);
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        setError('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setError('Payment cancelled. Please try again.');
                    },
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setLoading(false);
        }
    };

    if (authLoading || cartLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return null;
    }

    const totalAmount = cart.totalAmount || 0;
    const shippingCharges = totalAmount >= 500 ? 0 : 50;
    const taxAmount = Math.round(totalAmount * 0.18);
    const finalAmount = totalAmount + shippingCharges + taxAmount;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Address Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                            <CardDescription>
                                Enter your delivery address details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={shippingAddress.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={shippingAddress.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={shippingAddress.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                                    <Input
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={shippingAddress.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="House No., Building Name"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addressLine2">Address Line 2</Label>
                                    <Input
                                        id="addressLine2"
                                        name="addressLine2"
                                        value={shippingAddress.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Road Name, Area, Colony"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="landmark">Landmark</Label>
                                    <Input
                                        id="landmark"
                                        name="landmark"
                                        value={shippingAddress.landmark}
                                        onChange={handleInputChange}
                                        placeholder="Near..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="zipCode">PIN Code *</Label>
                                        <Input
                                            id="zipCode"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div>
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {cart.items.map((item) => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {item.book.title} × {item.quantity}
                                        </span>
                                        <span>₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>
                                        {shippingCharges === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${shippingCharges.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{finalAmount.toFixed(2)}</span>
                            </div>

                            {totalAmount < 500 && (
                                <p className="text-xs text-muted-foreground">
                                    Add ₹{(500 - totalAmount).toFixed(2)} more for FREE shipping
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
