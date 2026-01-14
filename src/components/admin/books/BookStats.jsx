'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function BookStats({ summary = {} }) {
    const stats = [
        {
            title: 'Total Books',
            value: summary.totalBooks || 0,
            icon: Package,
            description: `${summary.activeBooks || 0} active`,
            color: 'text-blue-600'
        },
        {
            title: 'Low Stock Items',
            value: summary.lowStockCount || 0,
            icon: AlertTriangle,
            description: 'Need restocking',
            color: 'text-orange-600'
        },
        {
            title: 'Total Inventory Value',
            value: `₹${((summary.totalValue || 0) / 1000).toFixed(1)}K`,
            icon: DollarSign,
            description: 'Current stock value',
            color: 'text-green-600'
        },
        {
            title: 'Active Books',
            value: summary.activeBooks || 0,
            icon: TrendingUp,
            description: 'Available for sale',
            color: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}