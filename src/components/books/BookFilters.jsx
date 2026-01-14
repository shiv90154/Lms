'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';

export default function BookFilters({
    categories = [],
    filters,
    onFiltersChange,
    onClearFilters,
    className = ""
}) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [priceRange, setPriceRange] = useState([0, 10000]);

    useEffect(() => {
        setLocalFilters(filters);
        if (filters.minPrice || filters.maxPrice) {
            setPriceRange([filters.minPrice || 0, filters.maxPrice || 10000]);
        }
    }, [filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
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

    const handleSubcategoryChange = (subcategory, checked) => {
        const currentSubcategories = localFilters.subcategories || [];
        let newSubcategories;

        if (checked) {
            newSubcategories = [...currentSubcategories, subcategory];
        } else {
            newSubcategories = currentSubcategories.filter(s => s !== subcategory);
        }

        handleFilterChange('subcategories', newSubcategories);
    };

    const handlePriceRangeChange = (values) => {
        setPriceRange(values);
        handleFilterChange('minPrice', values[0]);
        handleFilterChange('maxPrice', values[1]);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.categories?.length) count += localFilters.categories.length;
        if (localFilters.subcategories?.length) count += localFilters.subcategories.length;
        if (localFilters.newArrivals) count += 1;
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
                {/* Price Range */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <div className="px-2">
                        <Slider
                            value={priceRange}
                            onValueChange={handlePriceRangeChange}
                            max={10000}
                            min={0}
                            step={100}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((categoryData) => (
                            <div key={categoryData.category} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${categoryData.category}`}
                                        checked={localFilters.categories?.includes(categoryData.category) || false}
                                        onCheckedChange={(checked) =>
                                            handleCategoryChange(categoryData.category, checked)
                                        }
                                    />
                                    <Label
                                        htmlFor={`category-${categoryData.category}`}
                                        className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                        {categoryData.category}
                                        <span className="text-muted-foreground ml-1">
                                            ({categoryData.count})
                                        </span>
                                    </Label>
                                </div>

                                {/* Subcategories */}
                                {categoryData.subcategories?.length > 0 &&
                                    localFilters.categories?.includes(categoryData.category) && (
                                        <div className="ml-6 space-y-1">
                                            {categoryData.subcategories.map((subcategory) => (
                                                <div key={subcategory} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`subcategory-${subcategory}`}
                                                        checked={localFilters.subcategories?.includes(subcategory) || false}
                                                        onCheckedChange={(checked) =>
                                                            handleSubcategoryChange(subcategory, checked)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`subcategory-${subcategory}`}
                                                        className="text-sm font-normal cursor-pointer text-muted-foreground"
                                                    >
                                                        {subcategory}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Special Filters */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Special Offers</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="new-arrivals"
                                checked={localFilters.newArrivals || false}
                                onCheckedChange={(checked) =>
                                    handleFilterChange('newArrivals', checked)
                                }
                            />
                            <Label htmlFor="new-arrivals" className="text-sm font-normal cursor-pointer">
                                New Arrivals
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="discounted"
                                checked={localFilters.discounted || false}
                                onCheckedChange={(checked) =>
                                    handleFilterChange('discounted', checked)
                                }
                            />
                            <Label htmlFor="discounted" className="text-sm font-normal cursor-pointer">
                                On Sale
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="in-stock"
                                checked={localFilters.inStock || false}
                                onCheckedChange={(checked) =>
                                    handleFilterChange('inStock', checked)
                                }
                            />
                            <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                                In Stock Only
                            </Label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}