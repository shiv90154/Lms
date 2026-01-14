import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Student Enrollment',
    description: 'Enroll in our comprehensive coaching programs. Complete the enrollment form to start your learning journey with us.',
    keywords: ['enrollment', 'admission', 'coaching', 'courses', 'student registration', 'join now'],
    url: '/enroll',
});

export default function EnrollLayout({ children }) {
    return children;
}
