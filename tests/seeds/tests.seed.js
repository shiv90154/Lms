/**
 * Mock Test Seed Data
 * Provides sample test data for testing
 */

export const testSeeds = [
    {
        title: 'UPSC Prelims Mock Test 1',
        description: 'Comprehensive mock test for UPSC Prelims preparation',
        duration: 120, // 2 hours
        totalMarks: 200,
        negativeMarking: 0.33,
        instructions: [
            'Read all questions carefully',
            'Each question carries 2 marks',
            'There is negative marking of 0.33 marks for wrong answers',
            'You can review and change your answers before final submission'
        ],
        isActive: true,
        sections: [
            {
                title: 'General Studies',
                questions: [
                    {
                        text: 'Who was the first President of India?',
                        options: [
                            'Jawaharlal Nehru',
                            'Dr. Rajendra Prasad',
                            'Sardar Patel',
                            'Dr. B.R. Ambedkar'
                        ],
                        correctAnswer: 1,
                        explanation: 'Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.',
                        marks: 2,
                        difficulty: 'easy',
                        subject: 'History'
                    },
                    {
                        text: 'Which article of the Indian Constitution deals with Right to Equality?',
                        options: [
                            'Article 12',
                            'Article 14',
                            'Article 19',
                            'Article 21'
                        ],
                        correctAnswer: 1,
                        explanation: 'Article 14 of the Indian Constitution guarantees equality before law.',
                        marks: 2,
                        difficulty: 'medium',
                        subject: 'Polity'
                    },
                    {
                        text: 'What is the capital of Arunachal Pradesh?',
                        options: [
                            'Dispur',
                            'Itanagar',
                            'Imphal',
                            'Shillong'
                        ],
                        correctAnswer: 1,
                        explanation: 'Itanagar is the capital of Arunachal Pradesh.',
                        marks: 2,
                        difficulty: 'easy',
                        subject: 'Geography'
                    }
                ]
            },
            {
                title: 'Current Affairs',
                questions: [
                    {
                        text: 'Which country hosted the G20 Summit in 2023?',
                        options: [
                            'USA',
                            'India',
                            'China',
                            'Japan'
                        ],
                        correctAnswer: 1,
                        explanation: 'India hosted the G20 Summit in 2023 in New Delhi.',
                        marks: 2,
                        difficulty: 'easy',
                        subject: 'Current Affairs'
                    }
                ]
            }
        ]
    },
    {
        title: 'Mathematics Practice Test',
        description: 'Practice test for Class 12 Mathematics',
        duration: 180, // 3 hours
        totalMarks: 100,
        negativeMarking: 0,
        instructions: [
            'Attempt all questions',
            'Show all working',
            'No negative marking'
        ],
        isActive: true,
        sections: [
            {
                title: 'Algebra',
                questions: [
                    {
                        text: 'What is the value of x in the equation 2x + 5 = 15?',
                        options: ['3', '5', '7', '10'],
                        correctAnswer: 1,
                        explanation: '2x = 15 - 5 = 10, therefore x = 5',
                        marks: 4,
                        difficulty: 'easy',
                        subject: 'Algebra'
                    },
                    {
                        text: 'What is the derivative of x²?',
                        options: ['x', '2x', 'x²', '2'],
                        correctAnswer: 1,
                        explanation: 'The derivative of x² is 2x using the power rule.',
                        marks: 4,
                        difficulty: 'medium',
                        subject: 'Calculus'
                    }
                ]
            }
        ]
    },
    {
        title: 'Inactive Test',
        description: 'This test is not active',
        duration: 60,
        totalMarks: 50,
        negativeMarking: 0,
        instructions: ['Test instructions'],
        isActive: false,
        sections: []
    }
]

/**
 * Generate random test data
 */
export function generateRandomTest(overrides = {}) {
    const randomNum = Math.floor(Math.random() * 10000)
    const difficulties = ['easy', 'medium', 'hard']

    return {
        title: `Test ${randomNum}`,
        description: `Description for test ${randomNum}`,
        duration: Math.floor(Math.random() * 120) + 60,
        totalMarks: Math.floor(Math.random() * 200) + 50,
        negativeMarking: Math.random() > 0.5 ? 0.33 : 0,
        instructions: ['Read all questions carefully', 'Manage your time well'],
        isActive: true,
        sections: [
            {
                title: 'Section 1',
                questions: [
                    {
                        text: `Question ${randomNum}?`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: Math.floor(Math.random() * 4),
                        explanation: `Explanation for question ${randomNum}`,
                        marks: 2,
                        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
                        subject: 'General'
                    }
                ]
            }
        ],
        ...overrides
    }
}
