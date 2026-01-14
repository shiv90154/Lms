'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function EditTestPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        negativeMarking: 0.25,
        instructions: [],
        category: '',
        examType: '',
        difficulty: 'mixed',
        isPaid: false,
        price: 0,
        isActive: true,
        sections: []
    });

    useEffect(() => {
        fetchTest();
    }, [params.id]);

    const fetchTest = async () => {
        try {
            setFetching(true);
            const response = await fetch(`/api/admin/tests/${params.id}`);
            const data = await response.json();

            if (data.success) {
                const test = data.data;
                setFormData({
                    title: test.title || '',
                    description: test.description || '',
                    duration: test.duration || 60,
                    negativeMarking: test.negativeMarking || 0,
                    instructions: test.instructions || [],
                    category: test.category || '',
                    examType: test.examType || '',
                    difficulty: test.difficulty || 'mixed',
                    isPaid: test.isPaid || false,
                    price: test.price || 0,
                    isActive: test.isActive !== undefined ? test.isActive : true,
                    sections: test.sections || []
                });
            } else {
                setError(data.message || 'Failed to fetch test');
            }
        } catch (error) {
            console.error('Error fetching test:', error);
            setError('Failed to fetch test. Please try again.');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInstructionChange = (index, value) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = value;
        setFormData(prev => ({
            ...prev,
            instructions: newInstructions
        }));
    };

    const addInstruction = () => {
        setFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };

    const removeInstruction = (index) => {
        if (formData.instructions.length > 1) {
            const newInstructions = formData.instructions.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                instructions: newInstructions
            }));
        }
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    title: `Section ${prev.sections.length + 1}`,
                    order: prev.sections.length + 1,
                    timeLimit: null,
                    questions: [
                        {
                            text: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            explanation: '',
                            marks: 1,
                            difficulty: 'medium',
                            subject: '',
                            tags: []
                        }
                    ]
                }
            ]
        }));
    };

    const removeSection = (sectionIndex) => {
        if (formData.sections.length > 1) {
            const newSections = formData.sections.filter((_, i) => i !== sectionIndex);
            newSections.forEach((section, index) => {
                section.order = index + 1;
            });
            setFormData(prev => ({
                ...prev,
                sections: newSections
            }));
        }
    };

    const handleSectionChange = (sectionIndex, field, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex][field] = value;
        setFormData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const addQuestion = (sectionIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].questions.push({
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
            marks: 1,
            difficulty: 'medium',
            subject: '',
            tags: []
        });
        setFormData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const removeQuestion = (sectionIndex, questionIndex) => {
        const newSections = [...formData.sections];
        if (newSections[sectionIndex].questions.length > 1) {
            newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
            setFormData(prev => ({
                ...prev,
                sections: newSections
            }));
        }
    };

    const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].questions[questionIndex][field] = value;
        setFormData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const handleOptionChange = (sectionIndex, questionIndex, optionIndex, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].questions[questionIndex].options[optionIndex] = value;
        setFormData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const addOption = (sectionIndex, questionIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].questions[questionIndex].options.push('');
        setFormData(prev => ({
            ...prev,
            sections: newSections
        }));
    };

    const removeOption = (sectionIndex, questionIndex, optionIndex) => {
        const newSections = [...formData.sections];
        if (newSections[sectionIndex].questions[questionIndex].options.length > 2) {
            newSections[sectionIndex].questions[questionIndex].options =
                newSections[sectionIndex].questions[questionIndex].options.filter((_, i) => i !== optionIndex);

            const correctAnswer = newSections[sectionIndex].questions[questionIndex].correctAnswer;
            if (correctAnswer >= newSections[sectionIndex].questions[questionIndex].options.length) {
                newSections[sectionIndex].questions[questionIndex].correctAnswer = 0;
            }

            setFormData(prev => ({
                ...prev,
                sections: newSections
            }));
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Test title is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Test description is required');
            return false;
        }
        if (formData.duration < 1) {
            setError('Duration must be at least 1 minute');
            return false;
        }
        if (formData.sections.length === 0) {
            setError('At least one section is required');
            return false;
        }

        for (let i = 0; i < formData.sections.length; i++) {
            const section = formData.sections[i];
            if (!section.title.trim()) {
                setError(`Section ${i + 1} title is required`);
                return false;
            }
            if (section.questions.length === 0) {
                setError(`Section ${i + 1} must have at least one question`);
                return false;
            }

            for (let j = 0; j < section.questions.length; j++) {
                const question = section.questions[j];
                if (!question.text.trim()) {
                    setError(`Section ${i + 1}, Question ${j + 1}: Question text is required`);
                    return false;
                }
                if (question.options.length < 2) {
                    setError(`Section ${i + 1}, Question ${j + 1}: At least 2 options are required`);
                    return false;
                }
                for (let k = 0; k < question.options.length; k++) {
                    if (!question.options[k].trim()) {
                        setError(`Section ${i + 1}, Question ${j + 1}, Option ${k + 1}: Option text is required`);
                        return false;
                    }
                }
                if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                    setError(`Section ${i + 1}, Question ${j + 1}: Invalid correct answer`);
                    return false;
                }
                if (question.marks < 0) {
                    setError(`Section ${i + 1}, Question ${j + 1}: Marks must be non-negative`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/admin/tests/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Test updated successfully!');
                setTimeout(() => {
                    router.push('/admin/tests');
                }, 1500);
            } else {
                setError(data.message || 'Failed to update test');
            }
        } catch (error) {
            console.error('Error updating test:', error);
            setError('Failed to update test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <p>Loading test...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Mock Test</h1>
                <p className="text-gray-600 mt-1">Update test settings, sections, and questions</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                    {success}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>General test details and configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Test Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="e.g., UPSC Prelims Mock Test 2024"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    placeholder="e.g., UPSC, SSC, Banking"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the test purpose and content"
                                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="examType">Exam Type</Label>
                                <Input
                                    id="examType"
                                    value={formData.examType}
                                    onChange={(e) => handleInputChange('examType', e.target.value)}
                                    placeholder="e.g., Prelims, Mains"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value) => handleInputChange('difficulty', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="isActive">Test Status</Label>
                            <Select
                                value={formData.isActive ? 'active' : 'inactive'}
                                onValueChange={(value) => handleInputChange('isActive', value === 'active')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Marking Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Marking Configuration</CardTitle>
                        <CardDescription>Configure scoring and marking rules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="negativeMarking">Negative Marking</Label>
                                <Input
                                    id="negativeMarking"
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    value={formData.negativeMarking}
                                    onChange={(e) => handleInputChange('negativeMarking', parseFloat(e.target.value))}
                                />
                                <p className="text-sm text-gray-500">Marks deducted for wrong answers</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="isPaid">Access Type</Label>
                                <Select
                                    value={formData.isPaid ? 'paid' : 'free'}
                                    onValueChange={(value) => handleInputChange('isPaid', value === 'paid')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.isPaid && (
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Instructions</CardTitle>
                        <CardDescription>Instructions displayed to students before starting the test</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.instructions.map((instruction, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={instruction}
                                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                                    placeholder={`Instruction ${index + 1}`}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeInstruction(index)}
                                    disabled={formData.instructions.length === 1}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addInstruction}>
                            Add Instruction
                        </Button>
                    </CardContent>
                </Card>

                {/* Sections and Questions - Same as create page */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Sections and Questions</CardTitle>
                        <CardDescription>Organize questions into sections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {formData.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Section {sectionIndex + 1}</h3>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeSection(sectionIndex)}
                                        disabled={formData.sections.length === 1}
                                    >
                                        Remove Section
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Section Title *</Label>
                                        <Input
                                            value={section.title}
                                            onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                                            placeholder="e.g., General Knowledge"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Section Time Limit (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={section.timeLimit || ''}
                                            onChange={(e) => handleSectionChange(sectionIndex, 'timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Questions</h4>
                                    {section.questions.map((question, questionIndex) => (
                                        <div key={questionIndex} className="border rounded-md p-4 space-y-3 bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Question {questionIndex + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                                    disabled={section.questions.length === 1}
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Question Text *</Label>
                                                <textarea
                                                    value={question.text}
                                                    onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'text', e.target.value)}
                                                    placeholder="Enter the question"
                                                    className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Options *</Label>
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex gap-2 items-center">
                                                        <span className="text-sm font-medium w-8">{String.fromCharCode(65 + optionIndex)}.</span>
                                                        <Input
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                                            placeholder={`Option ${optionIndex + 1}`}
                                                            required
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                                                            disabled={question.options.length === 2}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addOption(sectionIndex, questionIndex)}
                                                >
                                                    Add Option
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Correct Answer *</Label>
                                                    <Select
                                                        value={question.correctAnswer.toString()}
                                                        onValueChange={(value) => handleQuestionChange(sectionIndex, questionIndex, 'correctAnswer', parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {question.options.map((_, optionIndex) => (
                                                                <SelectItem key={optionIndex} value={optionIndex.toString()}>
                                                                    Option {String.fromCharCode(65 + optionIndex)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Marks</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={question.marks}
                                                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'marks', parseFloat(e.target.value))}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Difficulty</Label>
                                                    <Select
                                                        value={question.difficulty}
                                                        onValueChange={(value) => handleQuestionChange(sectionIndex, questionIndex, 'difficulty', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="easy">Easy</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="hard">Hard</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Subject</Label>
                                                    <Input
                                                        value={question.subject}
                                                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'subject', e.target.value)}
                                                        placeholder="e.g., History, Mathematics"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Tags (comma-separated)</Label>
                                                    <Input
                                                        value={question.tags.join(', ')}
                                                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                                        placeholder="e.g., ancient, medieval"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Explanation</Label>
                                                <textarea
                                                    value={question.explanation}
                                                    onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'explanation', e.target.value)}
                                                    placeholder="Explain the correct answer"
                                                    className="w-full min-h-[60px] px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addQuestion(sectionIndex)}
                                    >
                                        Add Question to Section
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addSection}>
                            Add New Section
                        </Button>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/tests')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating Test...' : 'Update Test'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
