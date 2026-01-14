'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function MaterialFilters({
    categories = [],
    examTypes = [],
    years = [],
    types = [],
    filters,
    onFiltersChange,
    onClearFilters,
    className = ""
}) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [priceRange, setPriceRange] = useState([0, 5000]);

    useEffect(() => {
        setLocalFilters(filters);
        if (filters.minPrice || filters.maxPrice) {
            setPriceRange([filters.minPrice || 0, filters.maxPrice || 5000]);
        }
    }, [filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleTypeChange = (type, checked) => {
        const currentTypes = localFilters.types || [];
        let newTypes;

        if (checked) {
            newTypes = [...currentTypes, type];
        } else {
            newTypes = currentTypes.filter(t => t !== type);
        }

        handleFilterChange('types', newTypes);
    };

    const handleCategoryChange = (category, checked) => {
        const currentCategories = localFilters.categories || [];
        let newCategories;

        if (checked) {
            newCategories = [...currentCategories, category];
        } else {
            newCategories = currentCategories.filter(c => c !== category);
        }

        handleFilterChange('categories', newCategories);
    };

    const handlePriceRangeChange = (values) => {
        setPriceRange(values);
        handleFilterChange('minPrice', values[0]);
        handleFilterChange('maxPrice', values[1]);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.types?.length) count += localFilters.types.length;
        if (localFilters.categories?.length) count += localFilters.categories.length;
        if (localFilters.examType) count += 1;
        if (localFilters.year) count += 1;
        if (localFilters.isPaid !== undefined) count += 1;
        if (localFilters.minPrice || localFilters.maxPrice) count += 1;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </CardTitle>
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Exam Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Exam Type</Label>
                    <Select
                        value={localFilters.examType || ""}
                        onValueChange={(value) => handleFilterChange('examType', value || undefined)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Exams</SelectItem>
                            {examTypes.map((examType) => (
                                <SelectItem key={examType} value={examType}>
                                    {examType}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Year */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Year</Label>
                    <Select
                        value={localFilters.year?.toString() || ""}
                        onValueChange={(value) => handleFilterChange('year', value ? parseInt(value) : undefined)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Years</SelectItem>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Material Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Material Type</Label>
                    <div className="space-y-2">
                        {types.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`type-${type}`}
                                    checked={localFilters.types?.includes(type) || false}
                                    onCheckedChange={(checked) => handleTypeChange(type, checked)}
                                />
                                <Label
                                    htmlFor={`type-${type}`}
                                    className="text-sm font-normal cursor-pointer capitalize"
                                >
                                    {type.replace('_', ' ')}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`category-${category}`}
                                    checked={localFilters.categories?.includes(category) || false}
                                    onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                                />
                                <Label
                                    htmlFor={`category-${category}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {category}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Access Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Access Type</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="free-only"
                                checked={localFilters.isPaid === false}
                                onCheckedChange={(checked) =>
                                    handleFilterChange('isPaid', checked ? false : undefined)
                                }
                            />
                            <Label htmlFor="free-only" className="text-sm font-normal cursor-pointer">
                                Free Only
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="paid-only"
                                checked={localFilters.isPaid === true}
                                onCheckedChange={(checked) =>
                                    handleFilterChange('isPaid', checked ? true : undefined)
                                }
                            />
                            <Label htmlFor="paid-only" className="text-sm font-normal cursor-pointer">
                                Paid Only
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Price Range (only show if paid filter is active) */}
                {localFilters.isPaid === true && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Price Range</Label>
                            <div className="px-2">
                                <Slider
                                    value={priceRange}
                                    onValueChange={handlePriceRangeChange}
                                    max={5000}
                                    min={0}
                                    step={50}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>₹{priceRange[0].toLocaleString()}</span>
                                <span>₹{priceRange[1].toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
