'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CartItem from './CartItem';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    loading = false,
    trigger
}) {
    const [open, setOpen] = useState(false);

    const itemCount = cart?.itemCount || 0;
    const totalAmount = cart?.totalAmount || 0;
    const totalSavings = cart?.totalSavings || 0;

    const handleCheckout = () => {
        setOpen(false);
        // Navigation will be handled by the Link component
    };

    if (!cart || cart.items.length === 0) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm" className="relative">
                            <ShoppingCart className="h-4 w-4" />
                            {itemCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {itemCount}
                                </Badge>
                            )}
                        </Button>
                    )}
                </SheetTrigger>

                <SheetContent className="w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Shopping Cart
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                        <p className="text-muted-foreground mb-4">
                            Add some books to get started
                        </p>
                        <Button asChild onClick={() => setOpen(false)}>
                            <Link href="/books">
                                Browse Books
                            </Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="relative">
                        <ShoppingCart className="h-4 w-4" />
                        {itemCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                {itemCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Shopping Cart ({itemCount} items)
                        </div>
                        {cart.items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearCart}
                                disabled={loading}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                Clear All
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cart.items.map((item) => (
                        <CartItem
                            key={item._id}
                            item={item}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemoveItem={onRemoveItem}
                            loading={loading}
                        />
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-4 space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                        <span>Subtotal ({itemCount} items)</span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                    </div>

                    {/* Savings */}
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Total Savings</span>
                            <span>₹{totalSavings.toLocaleString()}</span>
                        </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <Button asChild className="w-full" size="lg" onClick={handleCheckout}>
                            <Link href="/cart">
                                View Cart & Checkout
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setOpen(false)}
                        >
                            Continue Shopping
                        </Button>
                    </div>

                    {/* Free Shipping Message */}
                    {totalAmount < 500 && (
                        <div className="text-xs text-center text-muted-foreground bg-blue-50 p-2 rounded-md">
                            Add ₹{(500 - totalAmount).toLocaleString()} more for FREE shipping
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}