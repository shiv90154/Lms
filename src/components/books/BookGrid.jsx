'use client';

import { useState } from 'react';
import BookCard from './BookCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Loader2 } from 'lucide-react';

export default function BookGrid({
    books = [],
    loading = false,
    pagination = null,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    onSortChange,
    onLoadMore,
    onAddToCart,
    onToggleWishlist,
    wishlistItems = []
}) {
    const [viewMode, setViewMode] = useState('grid');

    const handleSortChange = (value) => {
        const [newSortBy, newSortOrder] = value.split('-');
        onSortChange(newSortBy, newSortOrder);
    };

    const isInWishlist = (bookId) => {
        return wishlistItems.some(item => item._id === bookId);
    };

    if (loading && books.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading books...</span>
            </div>
        );
    }

    if (!loading && books.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground">
                    <p className="text-lg mb-2">No books found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with sorting and view options */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {pagination && (
                        <span>
                            Showing {books.length} of {pagination.totalCount} books
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Sort Options */}
                    <Select
                        value={`${sortBy}-${sortOrder}`}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt-desc">Newest First</SelectItem>
                            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="rating-desc">Highest Rated</SelectItem>
                            <SelectItem value="popularity-desc">Most Popular</SelectItem>
                            <SelectItem value="title-asc">Title: A to Z</SelectItem>
                            <SelectItem value="title-desc">Title: Z to A</SelectItem>
                            <SelectItem value="author-asc">Author: A to Z</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Books Grid/List */}
            <div className={
                viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "space-y-4"
            }>
                {books.map((book) => (
                    <BookCard
                        key={book._id}
                        book={book}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={isInWishlist(book._id)}
                        viewMode={viewMode}
                    />
                ))}
            </div>

            {/* Load More Button */}
            {pagination && pagination.hasNextPage && (
                <div className="flex justify-center pt-8">
                    <Button
                        onClick={onLoadMore}
                        disabled={loading}
                        variant="outline"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More Books'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}