import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Clock, ArrowLeft, Lock } from 'lucide-react';

// Enable ISR with revalidation every 1 hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/current-affairs/slug/${params.slug}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Current Affair Not Found',
                description: 'The requested current affair could not be found.'
            };
        }

        const data = await response.json();
        const content = data.data;

        return {
            title: content.seoTitle || content.title,
            description: content.seoDescription || content.summary,
            keywords: content.tags?.join(', '),
            openGraph: {
                title: content.seoTitle || content.title,
                description: content.seoDescription || content.summary,
                type: 'article',
                publishedTime: content.date,
                authors: ['LMS Admin'],
                images: content.imageUrl ? [content.imageUrl] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: content.seoTitle || content.title,
                description: content.seoDescription || content.summary,
                images: content.imageUrl ? [content.imageUrl] : [],
            },
            alternates: {
                canonical: `/current-affairs/${params.slug}`
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Current Affairs',
            description: 'Stay updated with current affairs'
        };
    }
}

async function getCurrentAffair(slug) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/current-affairs/slug/${slug}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                const data = await response.json();
                return { requiresAuth: true, preview: data };
            }
            return null;
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching current affair:', error);
        return null;
    }
}

export default async function CurrentAffairPage({ params }) {
    const result = await getCurrentAffair(params.slug);

    // Handle premium content that requires authentication
    if (result?.requiresAuth) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link href="/current-affairs">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Current Affairs
                    </Button>
                </Link>

                <Card className="max-w-4xl mx-auto">
                    <CardContent className="py-12 text-center">
                        <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h1 className="text-2xl font-bold mb-2">Premium Content</h1>
                        <p className="text-muted-foreground mb-6">
                            This is premium {result.preview.type} content. Please login to access.
                        </p>
                        {result.preview.title && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-2">{result.preview.title}</h2>
                                <p className="text-sm text-muted-foreground">{result.preview.summary}</p>
                            </div>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Link href="/auth/login">
                                <Button>Login to Access</Button>
                            </Link>
                            <Link href="/current-affairs">
                                <Button variant="outline">Browse Free Content</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!result) {
        notFound();
    }

    const content = result;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Link href="/current-affairs">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Current Affairs
                </Button>
            </Link>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant={content.type === 'daily' ? 'default' : 'secondary'}>
                            {content.type === 'daily' ? 'Daily' : 'Monthly'}
                        </Badge>
                        <Badge variant="outline">{content.category}</Badge>
                        {content.isPremium && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Premium
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold mb-4">{content.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(content.date)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {content.viewCount || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {content.readingTime || 5} min read
                        </span>
                    </div>

                    {content.summary && (
                        <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4 py-2">
                            {content.summary}
                        </p>
                    )}
                </header>

                {/* Featured Image */}
                {content.imageUrl && (
                    <div className="mb-8 rounded-lg overflow-hidden">
                        <img
                            src={content.imageUrl}
                            alt={content.title}
                            className="w-full h-auto"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none mb-8">
                    <div dangerouslySetInnerHTML={{ __html: content.content }} />
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold mb-2">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {content.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t pt-6">
                    <div className="flex justify-between items-center">
                        <Link href="/current-affairs">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to All Current Affairs
                            </Button>
                        </Link>
                        {content.type === 'daily' && (
                            <Link href="/current-affairs?type=monthly">
                                <Button>
                                    View Monthly Compilations
                                </Button>
                            </Link>
                        )}
                    </div>
                </footer>
            </article>
        </div>
    );
}
