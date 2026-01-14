'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        categories: [],
        tags: [],
        status: 'draft',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
    });
    const [categoryInput, setCategoryInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-generate slug from title
        if (name === 'title' && !formData.slug) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleAddCategory = () => {
        if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
            setFormData(prev => ({
                ...prev,
                categories: [...prev.categories, categoryInput.trim()]
            }));
            setCategoryInput('');
        }
    };

    const handleRemoveCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category)
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim().toLowerCase()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
            setFormData(prev => ({
                ...prev,
                seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
            }));
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setFormData(prev => ({
            ...prev,
            seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                router.push('/admin/blogs');
            } else {
                alert(data.message || 'Failed to create blog post');
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('Failed to create blog post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/admin/blogs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blogs
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* Main Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Blog Post</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter blog post title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    placeholder="blog-post-slug"
                                />
                            </div>

                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <textarea
                                    id="excerpt"
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Brief description of the blog post"
                                />
                            </div>

                            <div>
                                <Label htmlFor="content">Content *</Label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows={15}
                                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                                    placeholder="Enter blog post content (HTML supported)"
                                />
                            </div>

                            <div>
                                <Label htmlFor="featuredImage">Featured Image URL</Label>
                                <Input
                                    id="featuredImage"
                                    name="featuredImage"
                                    value={formData.featuredImage}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories and Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories & Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Categories</Label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={categoryInput}
                                        onChange={(e) => setCategoryInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                        placeholder="Add category"
                                    />
                                    <Button type="button" onClick={handleAddCategory}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.categories.map((category) => (
                                        <Badge key={category} variant="secondary">
                                            {category}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCategory(category)}
                                                className="ml-2"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Tags</Label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        placeholder="Add tag"
                                    />
                                    <Button type="button" onClick={handleAddTag}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="seoTitle">SEO Title</Label>
                                <Input
                                    id="seoTitle"
                                    name="seoTitle"
                                    value={formData.seoTitle}
                                    onChange={handleChange}
                                    maxLength={60}
                                    placeholder="SEO optimized title (max 60 characters)"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.seoTitle.length}/60 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="seoDescription">SEO Description</Label>
                                <textarea
                                    id="seoDescription"
                                    name="seoDescription"
                                    value={formData.seoDescription}
                                    onChange={handleChange}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="SEO meta description (max 160 characters)"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.seoDescription.length}/160 characters
                                </p>
                            </div>

                            <div>
                                <Label>SEO Keywords</Label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                        placeholder="Add keyword"
                                    />
                                    <Button type="button" onClick={handleAddKeyword}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.seoKeywords.map((keyword) => (
                                        <Badge key={keyword} variant="secondary">
                                            {keyword}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveKeyword(keyword)}
                                                className="ml-2"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publish Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/admin/blogs">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Creating...' : 'Create Blog Post'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
