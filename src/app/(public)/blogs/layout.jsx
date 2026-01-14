import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Blog',
    description: 'Insights, updates, and resources for your learning journey. Read our latest blog posts on education, exam preparation, and learning strategies.',
    keywords: ['blog', 'education', 'learning', 'exam preparation', 'study tips', 'competitive exams'],
    url: '/blogs',
});

export default function BlogsLayout({ children }) {
    return children;
}
