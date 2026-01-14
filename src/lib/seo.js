/**
 * SEO Utilities for automatic meta tag generation
 * Provides consistent SEO metadata across all pages
 */

const DEFAULT_SITE_NAME = 'LMS Platform';
const DEFAULT_SITE_DESCRIPTION = 'Comprehensive learning platform for courses, books, study materials, and mock tests';
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DEFAULT_OG_IMAGE = '/og-image.jpg';

/**
 * Generate base metadata for a page
 * @param {Object} options - Metadata options
 * @returns {Object} Next.js metadata object
 */
export function generatePageMetadata({
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors = [],
    noindex = false,
    nofollow = false,
    canonical,
}) {
    const fullTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_NAME;
    const fullDescription = description || DEFAULT_SITE_DESCRIPTION;
    const fullUrl = url ? `${DEFAULT_SITE_URL}${url}` : DEFAULT_SITE_URL;
    const ogImage = image || DEFAULT_OG_IMAGE;

    const metadata = {
        title: fullTitle,
        description: fullDescription,
        keywords: keywords.length > 0 ? keywords.join(', ') : undefined,

        // Open Graph
        openGraph: {
            title: fullTitle,
            description: fullDescription,
            url: fullUrl,
            siteName: DEFAULT_SITE_NAME,
            type,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title || DEFAULT_SITE_NAME,
                }
            ],
            locale: 'en_US',
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: fullDescription,
            images: [ogImage],
            creator: '@lmsplatform',
            site: '@lmsplatform',
        },

        // Robots
        robots: {
            index: !noindex,
            follow: !nofollow,
            googleBot: {
                index: !noindex,
                follow: !nofollow,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Canonical URL
        alternates: {
            canonical: canonical || fullUrl,
        },
    };

    // Add article-specific metadata
    if (type === 'article') {
        metadata.openGraph.publishedTime = publishedTime;
        metadata.openGraph.modifiedTime = modifiedTime;
        metadata.openGraph.authors = authors.length > 0 ? authors : ['LMS Admin'];
    }

    return metadata;
}

/**
 * Generate metadata for course pages
 */
export function generateCourseMetadata(course) {
    return generatePageMetadata({
        title: course.title,
        description: course.description,
        keywords: [
            course.category,
            course.level,
            ...(course.tags || []),
            'online course',
            'learning',
            'education'
        ],
        image: course.thumbnail,
        url: `/courses/${course._id}`,
        type: 'website',
    });
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(blog) {
    return generatePageMetadata({
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt,
        keywords: [
            ...(blog.categories || []),
            ...(blog.tags || []),
            'blog',
            'article',
            'education'
        ],
        image: blog.featuredImage,
        url: `/blogs/${blog.slug}`,
        type: 'article',
        publishedTime: blog.publishedAt,
        modifiedTime: blog.updatedAt,
        authors: blog.author ? [`${blog.author.firstName} ${blog.author.lastName}`] : [],
    });
}

/**
 * Generate metadata for current affairs
 */
export function generateCurrentAffairMetadata(content) {
    return generatePageMetadata({
        title: content.seoTitle || content.title,
        description: content.seoDescription || content.summary,
        keywords: [
            content.category,
            ...(content.tags || []),
            'current affairs',
            'news',
            'competitive exams'
        ],
        image: content.imageUrl,
        url: `/current-affairs/${content.slug}`,
        type: 'article',
        publishedTime: content.date,
        modifiedTime: content.updatedAt,
    });
}

/**
 * Generate metadata for book pages
 */
export function generateBookMetadata(book) {
    return generatePageMetadata({
        title: book.title,
        description: book.description,
        keywords: [
            book.category,
            book.subcategory,
            ...(book.tags || []),
            'book',
            'study material',
            book.author
        ].filter(Boolean),
        image: book.images?.[0],
        url: `/books/${book._id}`,
        type: 'product',
    });
}

/**
 * Generate metadata for study materials
 */
export function generateStudyMaterialMetadata(material) {
    return generatePageMetadata({
        title: material.title,
        description: material.description,
        keywords: [
            material.category,
            material.examType,
            material.type,
            ...(material.tags || []),
            'study material',
            'exam preparation'
        ].filter(Boolean),
        image: material.thumbnailUrl,
        url: `/study-materials/${material._id}`,
        type: 'website',
    });
}

/**
 * Generate metadata for mock test pages
 */
export function generateMockTestMetadata(test) {
    return generatePageMetadata({
        title: test.title,
        description: test.description,
        keywords: [
            'mock test',
            'practice test',
            'exam preparation',
            'assessment',
            ...(test.tags || [])
        ].filter(Boolean),
        url: `/tests/${test._id}`,
        type: 'website',
    });
}

/**
 * Generate structured data (JSON-LD) for courses
 */
export function generateCourseStructuredData(course) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: {
            '@type': 'Organization',
            name: DEFAULT_SITE_NAME,
            url: DEFAULT_SITE_URL,
        },
        offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
        image: course.thumbnail,
        educationalLevel: course.level,
        courseCode: course._id,
    };
}

/**
 * Generate structured data (JSON-LD) for articles
 */
export function generateArticleStructuredData(article, type = 'BlogPosting') {
    return {
        '@context': 'https://schema.org',
        '@type': type,
        headline: article.title,
        description: article.excerpt || article.summary,
        image: article.featuredImage || article.imageUrl,
        datePublished: article.publishedAt || article.date,
        dateModified: article.updatedAt,
        author: {
            '@type': 'Person',
            name: article.author ? `${article.author.firstName} ${article.author.lastName}` : 'LMS Admin',
        },
        publisher: {
            '@type': 'Organization',
            name: DEFAULT_SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${DEFAULT_SITE_URL}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${DEFAULT_SITE_URL}${article.url || ''}`,
        },
    };
}

/**
 * Generate structured data (JSON-LD) for products (books)
 */
export function generateProductStructuredData(product) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images?.[0],
        brand: {
            '@type': 'Brand',
            name: product.author || DEFAULT_SITE_NAME,
        },
        offers: {
            '@type': 'Offer',
            price: product.discountPrice || product.price,
            priceCurrency: 'INR',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${DEFAULT_SITE_URL}/books/${product._id}`,
        },
        aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 0,
        } : undefined,
    };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${DEFAULT_SITE_URL}${item.url}`,
        })),
    };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
