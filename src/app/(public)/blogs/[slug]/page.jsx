import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, ArrowLeft, Eye } from 'lucide-react';
import { generateBlogMetadata, generateArticleStructuredData } from '@/lib/seo';

// Enable ISR with revalidation every 1 hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/blogs/slug/${params.slug}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Blog Post Not Found',
                description: 'The requested blog post could not be found.'
            };
        }

        const data = await response.json();
        if (!data.success) {
            return {
                title: 'Blog Post Not Found',
                description: 'The requested blog post could not be found.'
            };
        }

        const blog = data.data.blog;
        return generateBlogMetadata(blog);
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog',
            description: 'Read our latest blog posts'
        };
    }
}

async function getBlogPost(slug) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/blogs/slug/${slug}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

export default async function BlogPostPage({ params }) {
    const result = await getBlogPost(params.slug);

    if (!result || !result.blog) {
        notFound();
    }

    const { blog, relatedPosts } = result;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Generate structured data
    const structuredData = generateArticleStructuredData({
        ...blog,
        url: `/blogs/${blog.slug}`,
        excerpt: blog.excerpt,
    });

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/blogs">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Blogs
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Article Header */}
                    <article>
                        <header className="mb-8">
                            {/* Categories */}
                            {blog.categories && blog.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {blog.categories.map((category) => (
                                        <Link key={category} href={`/blogs?category=${category}`}>
                                            <Badge variant="secondary">{category}</Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                        {blog.author?.firstName} {blog.author?.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(blog.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{blog.readingTime} min read</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>{blog.viewCount} views</span>
                                </div>
                            </div>

                            {/* Featured Image */}
                            {blog.featuredImage && (
                                <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
                                    <Image
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}
                        </header>

                        {/* Article Content */}
                        <div
                            className="prose prose-lg max-w-none mb-8"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mb-8">
                                <Separator className="mb-4" />
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <Link key={tag} href={`/blogs?tag=${tag}`}>
                                            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                                #{tag}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author Info */}
                        {blog.author && (
                            <div className="mb-8">
                                <Separator className="mb-4" />
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {blog.author.firstName} {blog.author.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Author</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Related Posts */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <div className="mt-12">
                            <Separator className="mb-8" />
                            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((post) => (
                                    <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <Link href={`/blogs/${post.slug}`}>
                                            {post.featuredImage && (
                                                <div className="relative h-40 w-full">
                                                    <Image
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(post.publishedAt)}
                                                </p>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
