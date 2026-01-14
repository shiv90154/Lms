'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound({
    title = '404 - Page Not Found',
    message = 'The page you are looking for does not exist or has been moved.',
}) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[600px] p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <FileQuestion className="h-24 w-24 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">{message}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                    <Link href="/">
                        <Button>
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
