'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookTable from '@/components/admin/books/BookTable';
import BookStats from '@/components/admin/books/BookStats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    RefreshCw,
    Trash2
} from 'lucide-react';

export default function AdminBooksPage() {
    const [books, setBooks] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        isActive: '',
        lowStock: false
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const router = useRouter();

    useEffect(() => {
        fetchBooks();
    }, [searchQuery, filters, sortBy, sortOrder]);

    const fetchBooks = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                router.push('/auth/login');
                return;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                sortBy,
                sortOrder
            });

            if (searchQuery) params.set('search', searchQuery);
            if (filters.category) params.set('category', filters.category);
            if (filters.isActive) params.set('isActive', filters.isActive);
            if (filters.lowStock) params.set('lowStock', 'true');

            const response = await fetch(`/api/admin/books?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setBooks(data.data.books);
                setPagination(data.data.pagination);
                setSummary(data.data.summary);
            } else if (response.status === 401 || response.status === 403) {
                router.push('/auth/login');
            } else {
                console.error('Error fetching books:', data.error);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBook = (bookId) => {
        setSelectedBooks(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        );
    };

    const handleSelectAll = () => {
        if (selectedBooks.length === books.length) {
            setSelectedBooks([]);
        } else {
            setSelectedBooks(books.map(book => book._id));
        }
    };

    const handleUpdateStock = async (bookId, newStock) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/admin/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stock: newStock })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state
                setBooks(prev => prev.map(book =>
                    book._id === bookId ? { ...book, stock: newStock } : book
                ));
            } else {
                console.error('Error updating stock:', data.error);
            }
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleEditBook = (book) => {
        router.push(`/admin/books/${book._id}/edit`);
    };

    const handleDeleteBook = async (book) => {
        if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/admin/books/${book._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                fetchBooks();
            } else {
                console.error('Error deleting book:', data.error);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    const handleViewBook = (book) => {
        router.push(`/books/${book._id}`);
    };

    const handleBulkDelete = async () => {
        if (selectedBooks.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/admin/books/bulk', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    operation: 'delete',
                    data: selectedBooks
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSelectedBooks([]);
                fetchBooks();
            } else {
                console.error('Error bulk deleting books:', data.error);
            }
        } catch (error) {
            console.error('Error bulk deleting books:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Book Inventory</h1>
                    <p className="text-muted-foreground">
                        Manage your book catalog and inventory
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => fetchBooks()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => router.push('/admin/books/create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Book
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <BookStats summary={summary} />

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search books by title, author, ISBN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select
                        value={filters.isActive}
                        onValueChange={(value) => setFilters({ ...filters, isActive: value })}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortBy}
                        onValueChange={setSortBy}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Date Added</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="soldCount">Sales</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant={filters.lowStock ? 'default' : 'outline'}
                        onClick={() => setFilters({ ...filters, lowStock: !filters.lowStock })}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Low Stock
                    </Button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedBooks.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedBooks.length} book(s) selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooks([])}
                        >
                            Clear Selection
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Books Table */}
            <BookTable
                books={books}
                loading={loading}
                selectedBooks={selectedBooks}
                onSelectBook={handleSelectBook}
                onSelectAll={handleSelectAll}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                onViewBook={handleViewBook}
                onUpdateStock={handleUpdateStock}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {books.length} of {pagination.totalCount} books
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchBooks(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fetchBooks(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}