/**
 * Dynamic robots.txt generation
 * Controls search engine crawling behavior
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/orders/',
                    '/cart/',
                    '/checkout/',
                    '/auth/',
                    '/_next/',
                    '/unauthorized',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/orders/',
                    '/cart/',
                    '/checkout/',
                    '/auth/',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
