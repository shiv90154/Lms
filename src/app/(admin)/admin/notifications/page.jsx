'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Plus,
    RefreshCw,
    Trash2,
    Edit,
    Bell,
    Mail,
    Users,
    AlertCircle
} from 'lucide-react';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        specificUsers: [],
        sendEmail: false,
        priority: 'medium',
        expiresAt: ''
    });

    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch(`/api/admin/notifications?page=${page}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setNotifications(data.data.notifications);
                setPagination(data.data.pagination);
            } else if (response.status === 401 || response.status === 403) {
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowCreateModal(false);
                setFormData({
                    title: '',
                    message: '',
                    type: 'info',
                    recipients: 'all',
                    specificUsers: [],
                    sendEmail: false,
                    priority: 'medium',
                    expiresAt: ''
                });
                fetchNotifications();
                alert('Notification created successfully!');
            } else {
                alert(data.error || 'Failed to create notification');
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Failed to create notification');
        }
    };

    const handleDeleteNotification = async (notification) => {
        if (!confirm(`Delete notification "${notification.title}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/admin/notifications/${notification._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeColor = (type) => {
        const colors = {
            info: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500',
            announcement: 'bg-purple-500'
        };
        return colors[type] || 'bg-gray-500';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-500',
            medium: 'bg-blue-500',
            high: 'bg-orange-500',
            urgent: 'bg-red-500'
        };
        return colors[priority] || 'bg-gray-500';
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">Send notifications to students</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => fetchNotifications()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Notification
                    </Button>
                </div>
            </div>

            {showCreateModal && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Notification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateNotification} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    className="w-full min-h-[100px] p-2 border rounded-md"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="success">Success</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="error">Error</SelectItem>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="recipients">Recipients</Label>
                                <Select
                                    value={formData.recipients}
                                    onValueChange={(value) => setFormData({ ...formData, recipients: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="students">Students Only</SelectItem>
                                        <SelectItem value="admins">Admins Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={formData.sendEmail}
                                    onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                />
                                <Label htmlFor="sendEmail">Send email notification</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Create Notification</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Recipients</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">No notifications found</TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification) => (
                                <TableRow key={notification._id}>
                                    <TableCell className="font-medium">{notification.title}</TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(notification.type)}>
                                            {notification.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(notification.priority)}>
                                            {notification.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{notification.recipients}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {notification.emailSent ? (
                                            <Mail className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteNotification(notification)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {notifications.length} of {pagination.totalCount} notifications
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchNotifications(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fetchNotifications(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
