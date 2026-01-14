'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';

export default function CartItem({
    item,
    onUpdateQuantity,
    onRemoveItem,
    loading = false
}) {
    const [quantity, setQuantity] = useState(item.quantity);
    const [updating, setUpdating] = useState(false);

    const book = item.book;
    const effectivePrice = item.discountPrice || item.price;
    const totalPrice = effectivePrice * quantity;
    const totalSavings = item.discountPrice
        ? (item.price - item.discountPrice) * quantity
        : 0;

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1 || newQuantity > book.stock) return;

        setUpdating(true);
        setQuantity(newQuantity);

        try {
            await onUpdateQuantity(book._id, newQuantity);
        } catch (error) {
            // Revert quantity on error
            setQuantity(item.quantity);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemove = async () => {
        setUpdating(true);
        try {
            await onRemoveItem(book._id);
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= book.stock) {
            handleQuantityChange(value);
        }
    };

    return (
        <div className={`flex gap-4 p-4 border rounded-lg ${updating ? 'opacity-50' : ''}`}>
            {/* Book Image */}
            <div className="relative w-20 h-28 flex-shrink-0">
                <Link href={`/books/${book._id}`}>
                    <Image
                        src={book.images[0]}
                        alt={book.title}
                        fill
                        className="object-cover rounded-md"
                        sizes="80px"
                    />
                </Link>
            </div>

            {/* Book Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-4">
                        <Link
                            href={`/books/${book._id}`}
                            className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                        >
                            {book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                            by {book.author}
                        </p>

                        {/* Category */}
                        <Badge variant="outline" className="text-xs mt-1">
                            {book.category}
                        </Badge>
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={updating || loading}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold">
                        ₹{effectivePrice.toLocaleString()}
                    </span>
                    {item.discountPrice && (
                        <>
                            <span className="text-sm text-muted-foreground line-through">
                                ₹{item.price.toLocaleString()}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                                {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                            </Badge>
                        </>
                    )}
                </div>

                {/* Quantity Controls and Total */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Qty:</span>
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1 || updating || loading}
                                className="h-8 w-8 p-0"
                            >
                                <Minus className="h-3 w-3" />
                            </Button>

                            <Input
                                type="number"
                                value={quantity}
                                onChange={handleInputChange}
                                disabled={updating || loading}
                                className="h-8 w-16 text-center border-0 focus-visible:ring-0"
                                min="1"
                                max={book.stock}
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= book.stock || updating || loading}
                                className="h-8 w-8 p-0"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>

                        {book.stock <= 5 && (
                            <span className="text-xs text-orange-600">
                                Only {book.stock} left
                            </span>
                        )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                        <div className="font-bold">
                            ₹{totalPrice.toLocaleString()}
                        </div>
                        {totalSavings > 0 && (
                            <div className="text-xs text-green-600">
                                You save ₹{totalSavings.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stock Warning */}
                {book.stock === 0 && (
                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                        <span className="text-sm text-destructive">
                            This item is currently out of stock
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}