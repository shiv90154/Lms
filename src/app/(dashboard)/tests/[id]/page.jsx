'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function TestTakingPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id;

    const [loading, setLoading] = useState(true);
    const [testStarted, setTestStarted] = useState(false);
    const [testData, setTestData] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showInstructions, setShowInstructions] = useState(true);
    const [warningCount, setWarningCount] = useState(0);

    const timerRef = useRef(null);
    const autoSaveRef = useRef(null);

    // Get all questions in flat array
    const allQuestions = testData?.sections?.flatMap(section =>
        section.questions.map(q => ({ ...q, sectionId: section._id, sectionTitle: section.title }))
    ) || [];

    // Anti-cheating: Detect tab/window visibility changes
    useEffect(() => {
        if (!testStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarningCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        alert('You have switched tabs/windows too many times. Your test will be auto-submitted.');
                        handleSubmit(true);
                    } else {
                        alert(`Warning ${newCount}/3: Please do not switch tabs or windows during the test.`);
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [testStarted]);

    // Anti-cheating: Prevent right-click and text selection
    useEffect(() => {
        if (!testStarted) return;

        const preventContextMenu = (e) => e.preventDefault();
        const preventCopy = (e) => e.preventDefault();

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('copy', preventCopy);
        document.addEventListener('cut', preventCopy);

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('cut', preventCopy);
        };
    }, [testStarted]);

    // Anti-cheating: Warn before page unload
    useEffect(() => {
        if (!testStarted) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Your test progress will be lost. Are you sure you want to leave?';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [testStarted]);

    // Timer countdown
    useEffect(() => {
        if (!testStarted || timeRemaining <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true); // Auto-submit when time expires
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [testStarted, timeRemaining]);

    // Auto-save progress every 30 seconds
    useEffect(() => {
        if (!testStarted || !attemptId) return;

        autoSaveRef.current = setInterval(() => {
            saveProgress();
        }, 30000); // Save every 30 seconds

        return () => {
            if (autoSaveRef.current) {
                clearInterval(autoSaveRef.current);
            }
        };
    }, [testStarted, attemptId, answers]);

    // Fetch test details
    useEffect(() => {
        fetchTestDetails();
    }, [testId]);

    const fetchTestDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tests/${testId}`);
            const data = await response.json();

            if (data.success) {
                setTestData(data.data);
            } else {
                setError(data.message || 'Failed to load test');
            }
        } catch (error) {
            console.error('Error fetching test:', error);
            setError('Failed to load test');
        } finally {
            setLoading(false);
        }
    };

    const startTest = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tests/${testId}/start`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                setAttemptId(data.data.attemptId);
                setStartTime(new Date(data.data.startedAt));
                setTestData(data.data.test);

                // Calculate time remaining
                const startedAt = new Date(data.data.startedAt);
                const duration = data.data.duration * 60; // Convert to seconds
                const elapsed = Math.floor((new Date() - startedAt) / 1000);
                const remaining = Math.max(0, duration - elapsed);

                setTimeRemaining(remaining);
                setTestStarted(true);
                setShowInstructions(false);
            } else {
                setError(data.message || 'Failed to start test');
            }
        } catch (error) {
            console.error('Error starting test:', error);
            setError('Failed to start test');
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async () => {
        if (!attemptId) return;

        try {
            const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer
            }));

            await fetch(`/api/tests/${testId}/save-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attemptId,
                    answers: answersArray
                })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (submitting) return;

        if (!isAutoSubmit) {
            const confirmed = confirm('Are you sure you want to submit your test? You cannot change your answers after submission.');
            if (!confirmed) return;
        }

        setSubmitting(true);

        try {
            // Clear timers
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);

            const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer
            }));

            const response = await fetch(`/api/tests/${testId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attemptId,
                    answers: answersArray,
                    isAutoSubmit
                })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to results page
                router.push(`/tests/${testId}/results/${attemptId}`);
            } else {
                setError(data.message || 'Failed to submit test');
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            setError('Failed to submit test');
            setSubmitting(false);
        }
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleQuestionJump = (index) => {
        setCurrentQuestionIndex(index);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (questionId) => {
        if (answers[questionId] !== undefined) return 'answered';
        return 'unanswered';
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading test...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    {error}
                </Alert>
                <Button className="mt-4" onClick={() => router.push('/tests')}>
                    Back to Tests
                </Button>
            </div>
        );
    }

    if (!testData) {
        return null;
    }

    // Show instructions before starting
    if (showInstructions && !testStarted) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{testData.title}</CardTitle>
                        <CardDescription>{testData.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="text-2xl font-bold">{testData.duration} min</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Questions</p>
                                <p className="text-2xl font-bold">{testData.totalQuestions}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Marks</p>
                                <p className="text-2xl font-bold">{testData.totalMarks}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Negative Marking</p>
                                <p className="text-2xl font-bold">-{testData.negativeMarking}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                            <ul className="space-y-2">
                                {testData.instructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2">{index + 1}.</span>
                                        <span>{instruction}</span>
                                    </li>
                                ))}
                                <li className="flex items-start text-red-600 font-medium">
                                    <span className="mr-2">⚠️</span>
                                    <span>Do not switch tabs or windows during the test. After 3 warnings, your test will be auto-submitted.</span>
                                </li>
                                <li className="flex items-start text-red-600 font-medium">
                                    <span className="mr-2">⚠️</span>
                                    <span>The test will be auto-submitted when the timer expires.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <Button variant="outline" onClick={() => router.push('/tests')}>
                                Cancel
                            </Button>
                            <Button onClick={startTest} disabled={loading}>
                                {loading ? 'Starting...' : 'Start Test'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = allQuestions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = allQuestions.length - answeredCount;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with timer */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">{testData.title}</h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {allQuestions.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Time Remaining</p>
                                <p className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatTime(timeRemaining)}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                variant="default"
                            >
                                {submitting ? 'Submitting...' : 'Submit Test'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Panel */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2">
                                            {currentQuestion.sectionTitle}
                                        </Badge>
                                        <CardTitle className="text-lg">
                                            Question {currentQuestionIndex + 1}
                                        </CardTitle>
                                    </div>
                                    <Badge>
                                        {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-lg whitespace-pre-wrap">
                                    {currentQuestion.text}
                                </div>

                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion._id] === index
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleAnswerSelect(currentQuestion._id, index)}
                                        >
                                            <div className="flex items-start">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${answers[currentQuestion._id] === index
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {answers[currentQuestion._id] === index && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium mr-2">
                                                        {String.fromCharCode(65 + index)}.
                                                    </span>
                                                    <span>{option}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={currentQuestionIndex === allQuestions.length - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-base">Question Navigator</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span>Answered ({answeredCount})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <span>Not Answered ({unansweredCount})</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                                    {allQuestions.map((q, index) => (
                                        <button
                                            key={q._id}
                                            onClick={() => handleQuestionJump(index)}
                                            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-all ${index === currentQuestionIndex
                                                    ? 'ring-2 ring-blue-500 ring-offset-2'
                                                    : ''
                                                } ${getQuestionStatus(q._id) === 'answered'
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
