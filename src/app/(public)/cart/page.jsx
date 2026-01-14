'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [validationIssues, setValidationIssues] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCart(data.data);
            } else if (response.status === 401) {
                router.push('/auth/login');
            } else {
                console.error('Error fetching cart:', data.error);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateCart = async () => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/cart/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCart(data.data.cart);
                setValidationIssues(data.data.validationResults);

                if (data.data.hasChanges) {
                    // Show notification about changes
                    console.log('Cart updated due to validation issues');
                }
            }
        } catch (error) {
            console.error('Error validating cart:', error);
        } finally {
            setUpdating(false);
        }
    };

    const updateQuantity = async (bookId, quantity) => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/cart', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId, quantity })
            });

            const data = await response.json();

            if (response.ok) {
                setCart(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (bookId) => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/cart/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCart(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        try {
            setUpdating(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCart(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleCheckout = () => {
        // TODO: Implement checkout flow
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-8">
                        Looks like you have not added any books to your cart yet.
                    </p>
                    <div className="space-y-4">
                        <Button asChild size="lg">
                            <Link href="/books">
                                Start Shopping
                            </Link>
                        </Button>
                        <div>
                            <Button variant="ghost" asChild>
                                <Link href="/">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <p className="text-muted-foreground">
                        {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={validateCart}
                        disabled={updating}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
                        Validate Cart
                    </Button>

                    <Button variant="ghost" asChild>
                        <Link href="/books">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Validation Issues */}
            {validationIssues.length > 0 && (
                <Alert className="mb-6">
                    <AlertDescription>
                        Some items in your cart have been updated due to price or stock changes.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <div className="space-y-0">
                                {cart.items.map((item, index) => (
                                    <div key={item._id}>
                                        <div className="p-4">
                                            <CartItem
                                                item={item}
                                                onUpdateQuantity={updateQuantity}
                                                onRemoveItem={removeItem}
                                                loading={updating}
                                            />
                                        </div>
                                        {index < cart.items.length - 1 && (
                                            <div className="border-b mx-4"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Clear Cart Button */}
                            <div className="p-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={clearCart}
                                    disabled={updating}
                                    className="text-destructive hover:text-destructive"
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cart Summary */}
                <div>
                    <CartSummary
                        cart={cart}
                        onCheckout={handleCheckout}
                        loading={updating}
                    />
                </div>
            </div>
        </div>
    );
}