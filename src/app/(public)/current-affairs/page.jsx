'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Eye, Search, TrendingUp, Lock, Loader2 } from 'lucide-react';

function CurrentAffairsContent() {
    const [content, setContent] = useState([]);
    const [categories, setCategories] = useState([]);
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const searchParams = useSearchParams();
    const router = useRouter();

    // Month names for display
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize from URL params
    useEffect(() => {
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        if (category) setSelectedCategory(category);
        if (month) setSelectedMonth(month);
        if (year) setSelectedYear(year);
        if (type) setSelectedType(type);
        if (search) setSearchQuery(search);
    }, [searchParams]);

    // Fetch initial data
    useEffect(() => {
        fetchCategories();
        fetchArchive();
    }, []);

    // Fetch content when filters change
    useEffect(() => {
        fetchContent();
    }, [selectedCategory, selectedMonth, selectedYear, selectedType, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/current-affairs/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchArchive = async () => {
        try {
            const response = await fetch('/api/current-affairs/archive');
            const data = await response.json();
            if (data.success) {
                setArchive(data.data.yearlyArchive);
            }
        } catch (error) {
            console.error('Error fetching archive:', error);
        }
    };

    const fetchContent = async (page = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedMonth) params.set('month', selectedMonth);
            if (selectedYear) params.set('year', selectedYear);
            if (selectedType) params.set('type', selectedType);
            if (searchQuery) params.set('q', searchQuery);

            const endpoint = searchQuery
                ? '/api/current-affairs/search'
                : '/api/current-affairs/filter';

            const response = await fetch(`${endpoint}?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setContent(data.data);
                setPagination(data.pagination);
            } else if (response.status === 401) {
                // Premium content requires authentication
                alert('Please login to access premium content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateURL();
    };

    const handleClearFilters = () => {
        setSelectedCategory('');
        setSelectedMonth('');
        setSelectedYear('');
        setSelectedType('');
        setSearchQuery('');
        router.push('/current-affairs');
    };

    const updateURL = () => {
        const params = new URLSearchParams();

        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedMonth) params.set('month', selectedMonth);
        if (selectedYear) params.set('year', selectedYear);
        if (selectedType) params.set('type', selectedType);
        if (searchQuery) params.set('search', searchQuery);

        const newURL = params.toString() ? `?${params.toString()}` : '/current-affairs';
        router.push(newURL, { scroll: false });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const hasActiveFilters = selectedCategory || selectedMonth || selectedYear || selectedType || searchQuery;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Current Affairs</h1>
                <p className="text-muted-foreground">
                    Stay updated with daily current affairs and monthly compilations
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search current affairs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={selectedType} onValueChange={(value) => {
                        setSelectedType(value);
                        setTimeout(updateURL, 0);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Content Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="daily">Daily (Free)</SelectItem>
                            <SelectItem value="monthly">Monthly (Premium)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={(value) => {
                        setSelectedCategory(value);
                        setTimeout(updateURL, 0);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.category} value={cat.category}>
                                    {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.count})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={(value) => {
                        setSelectedYear(value);
                        setTimeout(updateURL, 0);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Years</SelectItem>
                            {archive.map((yearData) => (
                                <SelectItem key={yearData.year} value={yearData.year.toString()}>
                                    {yearData.year} ({yearData.totalCount})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={(value) => {
                        setSelectedMonth(value);
                        setTimeout(updateURL, 0);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Months</SelectItem>
                            {monthNames.map((month, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : content.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No current affairs found matching your criteria.</p>
                        {hasActiveFilters && (
                            <Button variant="link" onClick={handleClearFilters} className="mt-2">
                                Clear filters to see all content
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.map((item) => (
                            <Card key={item._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge variant={item.type === 'daily' ? 'default' : 'secondary'}>
                                            {item.type === 'daily' ? 'Daily' : 'Monthly'}
                                        </Badge>
                                        {item.isPremium && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                Premium
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="line-clamp-2">
                                        <Link href={`/current-affairs/${item.slug}`} className="hover:underline">
                                            {item.title}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(item.date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {item.viewCount || 0}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {item.summary}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline">
                                            {item.category}
                                        </Badge>
                                        <Link href={`/current-affairs/${item.slug}`}>
                                            <Button variant="link" size="sm">
                                                Read More →
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                disabled={pagination.page === 1}
                                onClick={() => fetchContent(pagination.page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={pagination.page === pagination.pages}
                                onClick={() => fetchContent(pagination.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function CurrentAffairsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <CurrentAffairsContent />
        </Suspense>
    );
}
