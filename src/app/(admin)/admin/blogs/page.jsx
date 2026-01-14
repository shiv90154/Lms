'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Plus, MoreVertical, Edit, Trash2, Eye, Search } from 'lucide-react';

export default function AdminBlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, [searchQuery, statusFilter]);

    const fetchBlogs = async (page = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (searchQuery) params.set('search', searchQuery);
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/admin/blogs?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data.blogs);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this blog post?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/blogs/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                fetchBlogs();
            } else {
                alert(data.message || 'Failed to delete blog post');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog post');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const variants = {
            draft: 'secondary',
            published: 'default',
            archived: 'outline'
        };

        return (
            <Badge variant={variants[status] || 'secondary'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Blog Posts</CardTitle>
                        <Link href="/admin/blogs/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Post
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search blog posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-md"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No blog posts found
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Categories</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Published</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blogs.map((blog) => (
                                        <TableRow key={blog._id}>
                                            <TableCell className="font-medium">
                                                {blog.title}
                                            </TableCell>
                                            <TableCell>
                                                {blog.author?.firstName} {blog.author?.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(blog.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {blog.categories.slice(0, 2).map((cat) => (
                                                        <Badge key={cat} variant="outline" className="text-xs">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                    {blog.categories.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{blog.categories.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{blog.viewCount}</TableCell>
                                            <TableCell>
                                                {blog.publishedAt ? formatDate(blog.publishedAt) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {blog.status === 'published' && (
                                                            <DropdownMenuItem
                                                                onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/admin/blogs/${blog._id}`)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(blog._id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="mt-4 flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === 1}
                                        onClick={() => fetchBlogs(pagination.page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        Page {pagination.page} of {pagination.pages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === pagination.pages}
                                        onClick={() => fetchBlogs(pagination.page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
