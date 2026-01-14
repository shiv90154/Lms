'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Search, Tag, Loader2 } from 'lucide-react';

function BlogsContent() {
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize from URL params
    useEffect(() => {
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');

        if (category) setSelectedCategory(category);
        if (tag) setSelectedTag(tag);
        if (search) setSearchQuery(search);
    }, [searchParams]);

    // Fetch categories and tags
    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    // Fetch blogs when filters change
    useEffect(() => {
        fetchBlogs(1);
    }, [selectedCategory, selectedTag, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/blogs/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/blogs/tags');
            const data = await response.json();
            if (data.success) {
                setTags(data.data);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const fetchBlogs = async (page = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '9'
            });

            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedTag) params.set('tag', selectedTag);
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/blogs?${params.toString()}`);
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

    const handleSearch = (e) => {
        e.preventDefault();
        updateURL(selectedCategory, selectedTag, searchQuery);
        fetchBlogs(1);
    };

    const handleCategoryClick = (category) => {
        const newCategory = category === selectedCategory ? '' : category;
        setSelectedCategory(newCategory);
        updateURL(newCategory, selectedTag, searchQuery);
    };

    const handleTagClick = (tag) => {
        const newTag = tag === selectedTag ? '' : tag;
        setSelectedTag(newTag);
        updateURL(selectedCategory, newTag, searchQuery);
    };

    const updateURL = (category, tag, search) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (tag) params.set('tag', tag);
        if (search) params.set('search', search);

        const newURL = params.toString() ? `?${params.toString()}` : '/blogs';
        router.push(newURL, { scroll: false });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Blog</h1>
                <p className="text-muted-foreground text-lg">
                    Insights, updates, and resources for your learning journey
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2">
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
                    <Button type="submit">Search</Button>
                </div>
            </form>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                    {/* Categories */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Categories</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => handleCategoryClick(category.name)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.name
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{category.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {category.count}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.slice(0, 15).map((tag) => (
                                <Badge
                                    key={tag.name}
                                    variant={selectedTag === tag.name ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => handleTagClick(tag.name)}
                                >
                                    {tag.name} ({tag.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-48 bg-muted" />
                                    <CardHeader>
                                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-3 bg-muted rounded mb-2" />
                                        <div className="h-3 bg-muted rounded mb-2" />
                                        <div className="h-3 bg-muted rounded w-2/3" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No blog posts found</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <Link href={`/blogs/${blog.slug}`}>
                                            {blog.featuredImage && (
                                                <div className="relative h-48 w-full">
                                                    <Image
                                                        src={blog.featuredImage}
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <h2 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                                                    {blog.title}
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(blog.publishedAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {blog.readingTime} min read
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground line-clamp-3">
                                                    {blog.excerpt}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex flex-wrap gap-2">
                                                {blog.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </CardFooter>
                                        </Link>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === 1}
                                        onClick={() => fetchBlogs(pagination.page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <Button
                                                key={i}
                                                variant={pagination.page === i + 1 ? 'default' : 'outline'}
                                                onClick={() => fetchBlogs(i + 1)}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
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
                </div>
            </div>
        </div>
    );
}

export default function BlogsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <BlogsContent />
        </Suspense>
    );
}
