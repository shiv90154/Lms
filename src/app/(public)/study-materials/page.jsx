'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MaterialSearch from '@/components/study-materials/MaterialSearch';
import MaterialFilters from '@/components/study-materials/MaterialFilters';
import MaterialGrid from '@/components/study-materials/MaterialGrid';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

function StudyMaterialsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [years, setYears] = useState([]);
    const [types, setTypes] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [userPurchases, setUserPurchases] = useState([]);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        examType: searchParams.get('examType') || undefined,
        category: searchParams.get('category') || undefined,
        year: searchParams.get('year') ? parseInt(searchParams.get('year')) : undefined,
        types: searchParams.get('types')?.split(',').filter(Boolean) || [],
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        isPaid: searchParams.get('isPaid') === 'true' ? true : searchParams.get('isPaid') === 'false' ? false : undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined,
        sortBy: searchParams.get('sortBy') || 'relevance',
        page: searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    });

    // Fetch categories and filter options
    useEffect(() => {
        fetchCategories();
        fetchUserPurchases();
    }, []);

    // Fetch materials when filters change
    useEffect(() => {
        fetchMaterials();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/study-materials/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data.categories);
                setExamTypes(data.data.examTypes);
                setYears(data.data.years);
                setTypes(data.data.types);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchUserPurchases = async () => {
        try {
            const response = await fetch('/api/study-materials/my-purchases');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUserPurchases(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching user purchases:', error);
        }
    };

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters.search) params.append('search', filters.search);
            if (filters.examType) params.append('examType', filters.examType);
            if (filters.category) params.append('category', filters.category);
            if (filters.year) params.append('year', filters.year.toString());
            if (filters.types?.length) {
                filters.types.forEach(type => params.append('type', type));
            }
            if (filters.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.page) params.append('page', filters.page.toString());

            const response = await fetch(`/api/study-materials?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setMaterials(data.data.materials);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            examType: undefined,
            category: undefined,
            year: undefined,
            types: [],
            categories: [],
            isPaid: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            sortBy: 'relevance',
            page: 1
        });
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (sortBy) => {
        setFilters(prev => ({ ...prev, sortBy, page: 1 }));
    };

    const handleDownload = async (materialId) => {
        try {
            const response = await fetch(`/api/study-materials/${materialId}/download`);
            const data = await response.json();

            if (data.success) {
                // Open download URL in new tab
                window.open(data.data.downloadUrl, '_blank');
            } else {
                alert(data.error || 'Failed to download material');
            }
        } catch (error) {
            console.error('Error downloading material:', error);
            alert('Failed to download material');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
                <p className="text-muted-foreground">
                    Browse and download study materials for your exam preparation
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <MaterialSearch
                    onSearch={handleSearch}
                    initialValue={filters.search}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <MaterialFilters
                        categories={categories}
                        examTypes={examTypes}
                        years={years}
                        types={types}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Materials Grid */}
                <div className="lg:col-span-3">
                    {/* Sort and Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">
                            {pagination.totalCount || 0} materials found
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <Select value={filters.sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">Relevance</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                                    <SelectItem value="title">Title (A-Z)</SelectItem>
                                    <SelectItem value="year">Year (Latest)</SelectItem>
                                    <SelectItem value="price">Price (Low to High)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <MaterialGrid
                            materials={materials}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onDownload={handleDownload}
                            userPurchases={userPurchases}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StudyMaterialsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <StudyMaterialsContent />
        </Suspense>
    );
}
