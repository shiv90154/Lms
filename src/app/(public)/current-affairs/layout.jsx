import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Current Affairs',
    description: 'Stay updated with daily and monthly current affairs for competitive exam preparation. Access free daily updates and premium monthly compilations.',
    keywords: ['current affairs', 'daily news', 'monthly compilation', 'competitive exams', 'exam preparation', 'news updates'],
    url: '/current-affairs',
});

export default function CurrentAffairsLayout({ children }) {
    return children;
}
