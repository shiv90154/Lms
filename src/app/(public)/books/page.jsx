'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookGrid from '@/components/books/BookGrid';
import BookFilters from '@/components/books/BookFilters';
import BookSearch from '@/components/books/BookSearch';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, Loader2 } from 'lucide-react';

function BooksContent() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize filters from URL params
    useEffect(() => {
        const initialFilters = {};
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const newArrivals = searchParams.get('newArrivals');
        const sort = searchParams.get('sort');

        if (category) initialFilters.categories = [category];
        if (subcategory) initialFilters.subcategories = [subcategory];
        if (search) setSearchQuery(search);
        if (minPrice) initialFilters.minPrice = parseFloat(minPrice);
        if (maxPrice) initialFilters.maxPrice = parseFloat(maxPrice);
        if (newArrivals === 'true') initialFilters.newArrivals = true;

        if (sort) {
            const [sortField, sortDirection] = sort.split('-');
            setSortBy(sortField);
            setSortOrder(sortDirection);
        }

        setFilters(initialFilters);
    }, [searchParams]);

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch books when filters change
    useEffect(() => {
        fetchBooks(1); // Reset to first page when filters change
    }, [filters, sortBy, sortOrder, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/books/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBooks = async (page = 1, append = false) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                sortBy,
                sortOrder
            });

            // Add filters to params
            if (filters.categories?.length) {
                filters.categories.forEach(cat => params.append('category', cat));
            }
            if (filters.subcategories?.length) {
                filters.subcategories.forEach(subcat => params.append('subcategory', subcat));
            }
            if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
            if (filters.newArrivals) params.set('newArrivals', 'true');
            if (filters.discounted) params.set('discounted', 'true');
            if (filters.inStock) params.set('inStock', 'true');
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/books?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                if (append) {
                    setBooks(prev => [...prev, ...data.data.books]);
                } else {
                    setBooks(data.data.books);
                }
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        updateURL(newFilters, sortBy, sortOrder, searchQuery);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery('');
        updateURL({}, sortBy, sortOrder, '');
    };

    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        updateURL(filters, newSortBy, newSortOrder, searchQuery);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        updateURL(filters, sortBy, sortOrder, query);
    };

    const handleLoadMore = () => {
        if (pagination?.hasNextPage) {
            fetchBooks(pagination.currentPage + 1, true);
        }
    };

    const updateURL = (newFilters, newSortBy, newSortOrder, newSearchQuery) => {
        const params = new URLSearchParams();

        if (newFilters.categories?.length) {
            params.set('category', newFilters.categories[0]); // For simplicity, use first category
        }
        if (newFilters.subcategories?.length) {
            params.set('subcategory', newFilters.subcategories[0]);
        }
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
        if (newFilters.newArrivals) params.set('newArrivals', 'true');
        if (newSearchQuery) params.set('search', newSearchQuery);
        if (newSortBy !== 'createdAt' || newSortOrder !== 'desc') {
            params.set('sort', `${newSortBy}-${newSortOrder}`);
        }

        const newURL = params.toString() ? `?${params.toString()}` : '/books';
        router.push(newURL, { scroll: false });
    };

    const handleAddToCart = async (book) => {
        // TODO: Implement add to cart functionality
        console.log('Add to cart:', book);
    };

    const handleToggleWishlist = async (book) => {
        // TODO: Implement wishlist functionality
        console.log('Toggle wishlist:', book);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Book Store</h1>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <BookSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={handleSearch}
                            placeholder="Search books, authors, categories..."
                        />
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden">
                        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {Object.keys(filters).length > 0 && (
                                        <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                                            {Object.keys(filters).length}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <BookFilters
                                    categories={categories}
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    onClearFilters={handleClearFilters}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Desktop Filters Sidebar */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <BookFilters
                        categories={categories}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <BookGrid
                        books={books}
                        loading={loading}
                        pagination={pagination}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onLoadMore={handleLoadMore}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        wishlistItems={[]} // TODO: Implement wishlist
                    />
                </div>
            </div>
        </div>
    );
}


export default function BooksPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <BooksContent />
        </Suspense>
    );
}
