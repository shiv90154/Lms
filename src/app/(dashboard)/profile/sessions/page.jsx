'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Calendar,
    Shield,
    LogOut,
    Loader2,
    AlertTriangle
} from 'lucide-react';

// Simple time ago function
const timeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

export default function SessionsPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevoking, setIsRevoking] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/auth/sessions', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions);
            } else {
                console.error('Failed to fetch sessions');
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const revokeSession = async (sessionId) => {
        setIsRevoking(sessionId);
        try {
            const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setSessions(sessions.filter(session => session.id !== sessionId));
            } else {
                alert('Failed to revoke session');
            }
        } catch (error) {
            console.error('Error revoking session:', error);
            alert('Error revoking session');
        } finally {
            setIsRevoking(null);
        }
    };

    const revokeAllOtherSessions = async () => {
        setIsRevoking('all');
        try {
            const response = await fetch('/api/auth/sessions?revokeAll=true', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                // Keep only the current session
                setSessions(sessions.filter(session => session.isCurrent));
            } else {
                alert('Failed to revoke sessions');
            }
        } catch (error) {
            console.error('Error revoking sessions:', error);
            alert('Error revoking sessions');
        } finally {
            setIsRevoking(null);
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-5 w-5" />;
            case 'tablet':
                return <Tablet className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    const getBrowserIcon = (browser) => {
        return <Globe className="h-4 w-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Active Sessions</h1>
                <p className="text-muted-foreground">
                    Manage your active sessions and devices for security
                </p>
            </div>

            {/* Security Alert */}
            <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                                Security Notice
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                If you see any sessions you don't recognize, revoke them immediately
                                and consider changing your password.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sessions List */}
            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
                            <p className="text-muted-foreground">
                                You don't have any active sessions at the moment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {sessions.map((session) => (
                            <Card key={session.id} className={session.isCurrent ? 'ring-2 ring-primary' : ''}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-muted rounded-lg">
                                                {getDeviceIcon(session.deviceInfo.device)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {session.deviceInfo.device} • {session.deviceInfo.os}
                                                    </h3>
                                                    {session.isCurrent && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Current Session
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        {getBrowserIcon(session.deviceInfo.browser)}
                                                        <span>{session.deviceInfo.browser}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-4 w-4" />
                                                        <span>{session.deviceInfo.ip}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Active {timeAgo(session.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revokeSession(session.id)}
                                                disabled={isRevoking === session.id}
                                            >
                                                {isRevoking === session.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <LogOut className="h-4 w-4 mr-2" />
                                                        Revoke
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Revoke All Button */}
                        {sessions.filter(s => !s.isCurrent).length > 0 && (
                            <Card className="border-destructive/20">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Security Actions</CardTitle>
                                    <CardDescription>
                                        Revoke all other sessions if you suspect unauthorized access
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="destructive"
                                        onClick={revokeAllOtherSessions}
                                        disabled={isRevoking === 'all'}
                                    >
                                        {isRevoking === 'all' ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Revoking...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Revoke All Other Sessions
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}