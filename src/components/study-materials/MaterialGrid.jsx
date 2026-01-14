'use client';

import MaterialCard from './MaterialCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MaterialGrid({
    materials = [],
    pagination = {},
    onPageChange,
    onDownload,
    userPurchases = []
}) {
    const { currentPage = 1, totalPages = 1, hasNextPage, hasPrevPage } = pagination;

    const checkUserAccess = (materialId) => {
        return userPurchases.some(
            purchase => purchase.materialId?._id === materialId || purchase.materialId === materialId
        );
    };

    if (materials.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No study materials found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search query
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                    <MaterialCard
                        key={material._id}
                        material={material}
                        onDownload={onDownload}
                        userHasAccess={checkUserAccess(material._id)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!hasPrevPage}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(pageNum)}
                                    className="w-10"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Results Info */}
            <div className="text-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
        </div>
    );
}
