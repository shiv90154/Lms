'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star, ShoppingCart, Heart } from 'lucide-react';

export default function BookCard({ book, onAddToCart, onToggleWishlist, isInWishlist = false }) {
    const effectivePrice = book.discountPrice || book.price;
    const discountPercentage = book.discountPrice
        ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(book);
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleWishlist) {
            onToggleWishlist(book);
        }
    };

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <Link href={`/books/${book._id}`}>
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={book.images[0]}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {book.isNewArrival && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                                New
                            </Badge>
                        )}
                        {discountPercentage > 0 && (
                            <Badge variant="destructive">
                                {discountPercentage}% OFF
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                    >
                        <Heart
                            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        />
                    </button>

                    {/* Stock Status */}
                    {book.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">
                                Out of Stock
                            </Badge>
                        </div>
                    )}
                </div>

                <CardContent className="p-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {book.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            by {book.author}
                        </p>

                        {/* Rating */}
                        {book.rating > 0 && (
                            <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3 w-3 ${i < Math.floor(book.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    ({book.reviewCount})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                                ₹{effectivePrice.toLocaleString()}
                            </span>
                            {book.discountPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                    ₹{book.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Category */}
                        <Badge variant="outline" className="text-xs">
                            {book.category}
                        </Badge>
                    </div>
                </CardContent>
            </Link>

            <CardFooter className="p-4 pt-0">
                <Button
                    onClick={handleAddToCart}
                    disabled={book.stock === 0}
                    className="w-full"
                    size="sm"
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </CardFooter>
        </Card>
    );
}