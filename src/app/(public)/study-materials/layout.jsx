import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Study Materials',
    description: 'Access comprehensive study materials including previous year papers, study notes, and PDFs for competitive exam preparation.',
    keywords: ['study materials', 'previous year papers', 'study notes', 'exam preparation', 'competitive exams', 'practice papers'],
    url: '/study-materials',
});

export default function StudyMaterialsLayout({ children }) {
    return children;
}
