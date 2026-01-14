'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Package,
    TrendingUp,
    TrendingDown,
    AlertTriangle
} from 'lucide-react';

export default function BookTable({
    books = [],
    loading = false,
    selectedBooks = [],
    onSelectBook,
    onSelectAll,
    onEditBook,
    onDeleteBook,
    onViewBook,
    onUpdateStock
}) {
    const [editingStock, setEditingStock] = useState({});

    const handleStockEdit = (bookId, currentStock) => {
        setEditingStock({ ...editingStock, [bookId]: currentStock });
    };

    const handleStockSave = async (bookId) => {
        const newStock = editingStock[bookId];
        if (newStock !== undefined && newStock >= 0) {
            await onUpdateStock(bookId, parseInt(newStock));
            setEditingStock({ ...editingStock, [bookId]: undefined });
        }
    };

    const handleStockCancel = (bookId) => {
        setEditingStock({ ...editingStock, [bookId]: undefined });
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', variant: 'destructive', icon: AlertTriangle };
        if (stock <= 5) return { label: 'Low Stock', variant: 'secondary', icon: TrendingDown };
        if (stock <= 10) return { label: 'Medium Stock', variant: 'outline', icon: Package };
        return { label: 'In Stock', variant: 'default', icon: TrendingUp };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedBooks.length === books.length && books.length > 0}
                                onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead>Book Details</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {books.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                No books found
                            </TableCell>
                        </TableRow>
                    ) : (
                        books.map((book) => {
                            const stockStatus = getStockStatus(book.stock);
                            const StockIcon = stockStatus.icon;
                            const isEditing = editingStock[book._id] !== undefined;

                            return (
                                <TableRow key={book._id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedBooks.includes(book._id)}
                                            onCheckedChange={() => onSelectBook(book._id)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <div className="relative w-12 h-16">
                                            <Image
                                                src={book.images[0]}
                                                alt={book.title}
                                                fill
                                                className="object-cover rounded"
                                                sizes="48px"
                                            />
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium line-clamp-2 max-w-xs">
                                                {book.title}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                by {book.author}
                                            </div>
                                            {book.isbn && (
                                                <div className="text-xs text-muted-foreground">
                                                    ISBN: {book.isbn}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline">
                                            {book.category}
                                        </Badge>
                                        {book.subcategory && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {book.subcategory}
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {formatPrice(book.discountPrice || book.price)}
                                            </div>
                                            {book.discountPrice && (
                                                <div className="text-sm text-muted-foreground line-through">
                                                    {formatPrice(book.price)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={editingStock[book._id]}
                                                    onChange={(e) => setEditingStock({
                                                        ...editingStock,
                                                        [book._id]: e.target.value
                                                    })}
                                                    className="w-20 h-8"
                                                    min="0"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStockSave(book._id)}
                                                    className="h-8 px-2"
                                                >
                                                    ✓
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStockCancel(book._id)}
                                                    className="h-8 px-2"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                className="cursor-pointer hover:bg-accent rounded p-1"
                                                onClick={() => handleStockEdit(book._id, book.stock)}
                                            >
                                                <div className="font-medium">{book.stock}</div>
                                                <Badge variant={stockStatus.variant} className="text-xs">
                                                    <StockIcon className="h-3 w-3 mr-1" />
                                                    {stockStatus.label}
                                                </Badge>
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={book.isActive ? 'default' : 'secondary'}>
                                                {book.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            {book.isNewArrival && (
                                                <Badge variant="outline" className="text-xs">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{book.soldCount || 0}</div>
                                            {book.rating > 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    ⭐ {book.rating.toFixed(1)} ({book.reviewCount})
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onViewBook(book)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEditBook(book)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Book
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteBook(book)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Book
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}