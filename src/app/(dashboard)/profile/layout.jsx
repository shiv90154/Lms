'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ArrowLeft } from 'lucide-react';

export default function ProfileLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        {
            href: '/profile',
            label: 'Profile Settings',
            icon: User,
            active: pathname === '/profile'
        },
        {
            href: '/profile/sessions',
            label: 'Active Sessions',
            icon: Shield,
            active: pathname === '/profile/sessions'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* Back Navigation */}
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-semibold mb-4">Account Settings</h2>
                                <nav className="space-y-2">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <Button
                                                    variant={item.active ? "secondary" : "ghost"}
                                                    className="w-full justify-start gap-2"
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}