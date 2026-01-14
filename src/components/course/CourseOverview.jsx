'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    PlayCircle,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Video,
    FileText
} from 'lucide-react';

export default function CourseOverview({ course, progress, onLessonSelect }) {
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [expandedChapters, setExpandedChapters] = useState(new Set());

    useEffect(() => {
        // Auto-expand the first module and chapter
        if (course.modules.length > 0) {
            setExpandedModules(new Set([course.modules[0]._id]));
            if (course.modules[0].chapters.length > 0) {
                setExpandedChapters(new Set([course.modules[0].chapters[0]._id]));
            }
        }
    }, [course]);

    const toggleModule = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const toggleChapter = (chapterId) => {
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId);
        } else {
            newExpanded.add(chapterId);
        }
        setExpandedChapters(newExpanded);
    };

    const isLessonCompleted = (lessonId) => {
        if (!progress) return false;
        return progress.completedLessons.some(
            completion => completion.lessonId === lessonId
        );
    };

    const isCurrentLesson = (lessonId) => {
        if (!progress || !progress.currentLesson) return false;
        return progress.currentLesson.lessonId === lessonId;
    };

    const getModuleProgress = (module) => {
        if (!progress) return 0;

        let totalLessons = 0;
        let completedLessons = 0;

        module.chapters.forEach(chapter => {
            chapter.lessons.forEach(lesson => {
                totalLessons++;
                if (isLessonCompleted(lesson._id)) {
                    completedLessons++;
                }
            });
        });

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    };

    const getChapterProgress = (chapter) => {
        if (!progress) return 0;

        let totalLessons = chapter.lessons.length;
        let completedLessons = 0;

        chapter.lessons.forEach(lesson => {
            if (isLessonCompleted(lesson._id)) {
                completedLessons++;
            }
        });

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    };

    const getLessonIcon = (lesson) => {
        switch (lesson.type) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'text':
                return <BookOpen className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '';
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Content
                </CardTitle>
                {progress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{progress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {course.modules.map((module, moduleIndex) => {
                    const moduleProgress = getModuleProgress(module);
                    const isModuleExpanded = expandedModules.has(module._id);

                    return (
                        <div key={module._id} className="border rounded-lg">
                            <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleModule(module._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isModuleExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                        )}
                                        <div>
                                            <h3 className="font-medium">
                                                Module {moduleIndex + 1}: {module.title}
                                            </h3>
                                            {module.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {module.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={moduleProgress === 100 ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        >
                                            {moduleProgress}%
                                        </Badge>
                                        {moduleProgress === 100 && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isModuleExpanded && (
                                <div className="border-t bg-gray-50">
                                    {module.chapters.map((chapter, chapterIndex) => {
                                        const chapterProgress = getChapterProgress(chapter);
                                        const isChapterExpanded = expandedChapters.has(chapter._id);

                                        return (
                                            <div key={chapter._id} className="border-b last:border-b-0">
                                                <div
                                                    className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => toggleChapter(chapter._id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {isChapterExpanded ? (
                                                                <ChevronDown className="h-3 w-3 text-gray-500" />
                                                            ) : (
                                                                <ChevronRight className="h-3 w-3 text-gray-500" />
                                                            )}
                                                            <div>
                                                                <h4 className="text-sm font-medium">
                                                                    Chapter {chapterIndex + 1}: {chapter.title}
                                                                </h4>
                                                                {chapter.description && (
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {chapter.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${chapterProgress === 100 ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                                            >
                                                                {chapterProgress}%
                                                            </Badge>
                                                            {chapterProgress === 100 && (
                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isChapterExpanded && (
                                                    <div className="bg-white">
                                                        {chapter.lessons.map((lesson, lessonIndex) => {
                                                            const completed = isLessonCompleted(lesson._id);
                                                            const current = isCurrentLesson(lesson._id);

                                                            return (
                                                                <div
                                                                    key={lesson._id}
                                                                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${current ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                                                        }`}
                                                                    onClick={() => onLessonSelect && onLessonSelect(lesson, module._id, chapter._id)}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            {getLessonIcon(lesson)}
                                                                            <div>
                                                                                <div className="text-sm font-medium flex items-center gap-2">
                                                                                    Lesson {lessonIndex + 1}: {lesson.title}
                                                                                    {current && (
                                                                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                                                                                            Current
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                {lesson.description && (
                                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                                        {lesson.description}
                                                                                    </p>
                                                                                )}
                                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                                    {lesson.duration && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            {formatDuration(lesson.duration)}
                                                                                        </span>
                                                                                    )}
                                                                                    <span className="capitalize">{lesson.type}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {completed ? (
                                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                            ) : (
                                                                                <PlayCircle className="h-4 w-4 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}