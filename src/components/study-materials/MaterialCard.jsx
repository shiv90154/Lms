'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Lock, FileText, BookOpen, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function MaterialCard({ material, onDownload, userHasAccess = false }) {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-5 w-5" />;
            case 'notes':
                return <BookOpen className="h-5 w-5" />;
            case 'previous_paper':
                return <FileCheck className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'pdf':
                return 'PDF';
            case 'notes':
                return 'Notes';
            case 'previous_paper':
                return 'Previous Paper';
            default:
                return type;
        }
    };

    const canDownload = !material.isPaid || userHasAccess;

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {getTypeIcon(material.type)}
                        <span className="text-sm font-medium">{getTypeLabel(material.type)}</span>
                    </div>
                    <div className="flex gap-1">
                        {material.isPaid ? (
                            <Badge variant="default">₹{material.price}</Badge>
                        ) : (
                            <Badge variant="secondary">Free</Badge>
                        )}
                    </div>
                </div>
                <Link href={`/study-materials/${material._id}`}>
                    <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors mt-2">
                        {material.title}
                    </h3>
                </Link>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {material.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                        {material.examType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {material.category}
                    </Badge>
                    {material.year && (
                        <Badge variant="outline" className="text-xs">
                            {material.year}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {material.downloadCount} downloads
                    </span>
                    {material.fileSize && (
                        <span>
                            {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3">
                {canDownload ? (
                    <Button
                        onClick={() => onDownload(material._id)}
                        className="w-full"
                        variant="default"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                ) : (
                    <Link href={`/study-materials/${material._id}`} className="w-full">
                        <Button className="w-full" variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Purchase to Access
                        </Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
