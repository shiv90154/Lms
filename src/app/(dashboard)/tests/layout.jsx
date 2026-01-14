import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Mock Tests',
    description: 'Take comprehensive mock tests with detailed scoring and ranking. Practice with timed assessments to prepare for competitive exams.',
    keywords: ['mock tests', 'practice tests', 'exam preparation', 'competitive exams', 'assessment', 'test series'],
    url: '/tests',
    noindex: true, // Dashboard pages should not be indexed
});

export default function TestsLayout({ children }) {
    return children;
}
