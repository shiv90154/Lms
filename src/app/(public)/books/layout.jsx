import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Books Store',
    description: 'Browse and purchase books for competitive exam preparation. Find study materials, reference books, and practice guides for various exams.',
    keywords: ['books', 'study materials', 'exam preparation', 'competitive exams', 'reference books', 'practice guides'],
    url: '/books',
});

export default function BooksLayout({ children }) {
    return children;
}
