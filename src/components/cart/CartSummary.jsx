'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Truck, Shield, ArrowRight } from 'lucide-react';

export default function CartSummary({
    cart,
    onCheckout,
    loading = false,
    showCheckoutButton = true
}) {
    if (!cart || cart.items.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                </CardContent>
            </Card>
        );
    }

    const subtotal = cart.totalAmount;
    const savings = cart.totalSavings;
    const shippingCharges = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const total = subtotal + shippingCharges;

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Items Count */}
                <div className="flex justify-between text-sm">
                    <span>Items ({cart.itemCount})</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>

                {/* Savings */}
                {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Total Savings</span>
                        <span>-₹{savings.toLocaleString()}</span>
                    </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Shipping
                    </span>
                    <span>
                        {shippingCharges === 0 ? (
                            <Badge variant="secondary" className="text-xs">FREE</Badge>
                        ) : (
                            `₹${shippingCharges}`
                        )}
                    </span>
                </div>

                {/* Free Shipping Message */}
                {shippingCharges > 0 && (
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md">
                        Add ₹{(500 - subtotal).toLocaleString()} more for FREE shipping
                    </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                {showCheckoutButton && (
                    <Button
                        onClick={onCheckout}
                        disabled={loading || cart.items.length === 0}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout with 256-bit SSL encryption</span>
                </div>

                {/* Benefits */}
                <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Free returns within 7 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Cash on delivery available</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>24/7 customer support</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}