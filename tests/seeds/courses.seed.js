/**
 * Course Seed Data
 * Provides sample course data for testing
 */

export function generateCourseSeeds(instructorId) {
    return [
        {
            title: 'Introduction to Web Development',
            description: 'Learn the basics of web development including HTML, CSS, and JavaScript',
            price: 2999,
            category: 'Web Development',
            thumbnail: 'https://example.com/thumbnails/web-dev.jpg',
            level: 'beginner',
            tags: ['HTML', 'CSS', 'JavaScript', 'Web'],
            instructor: instructorId,
            isActive: true,
            rating: 4.5,
            modules: [
                {
                    title: 'Getting Started',
                    order: 1,
                    description: 'Introduction to web development',
                    chapters: [
                        {
                            title: 'HTML Basics',
                            order: 1,
                            description: 'Learn HTML fundamentals',
                            lessons: [
                                {
                                    title: 'Introduction to HTML',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 15,
                                    order: 1,
                                    isLocked: false,
                                    description: 'Learn what HTML is and why it matters'
                                },
                                {
                                    title: 'HTML Tags and Elements',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 20,
                                    order: 2,
                                    isLocked: false
                                }
                            ]
                        },
                        {
                            title: 'CSS Basics',
                            order: 2,
                            lessons: [
                                {
                                    title: 'Introduction to CSS',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 18,
                                    order: 1,
                                    isLocked: true
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Advanced Topics',
                    order: 2,
                    chapters: [
                        {
                            title: 'JavaScript Fundamentals',
                            order: 1,
                            lessons: [
                                {
                                    title: 'Variables and Data Types',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 25,
                                    order: 1,
                                    isLocked: true
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: 'Advanced Python Programming',
            description: 'Master advanced Python concepts and build real-world applications',
            price: 4999,
            category: 'Programming',
            thumbnail: 'https://example.com/thumbnails/python.jpg',
            level: 'advanced',
            tags: ['Python', 'Programming', 'Advanced'],
            instructor: instructorId,
            isActive: true,
            rating: 4.8,
            modules: [
                {
                    title: 'Object-Oriented Programming',
                    order: 1,
                    chapters: [
                        {
                            title: 'Classes and Objects',
                            order: 1,
                            lessons: [
                                {
                                    title: 'Introduction to OOP',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 30,
                                    order: 1,
                                    isLocked: false
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: 'Data Structures and Algorithms',
            description: 'Learn essential data structures and algorithms for coding interviews',
            price: 3999,
            category: 'Computer Science',
            thumbnail: 'https://example.com/thumbnails/dsa.jpg',
            level: 'intermediate',
            tags: ['DSA', 'Algorithms', 'Interview Prep'],
            instructor: instructorId,
            isActive: true,
            rating: 4.7,
            modules: [
                {
                    title: 'Arrays and Strings',
                    order: 1,
                    chapters: [
                        {
                            title: 'Array Basics',
                            order: 1,
                            lessons: [
                                {
                                    title: 'Introduction to Arrays',
                                    type: 'video',
                                    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    duration: 20,
                                    order: 1,
                                    isLocked: false
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: 'Inactive Course',
            description: 'This course is not active',
            price: 1999,
            category: 'Test',
            thumbnail: 'https://example.com/thumbnails/inactive.jpg',
            level: 'beginner',
            tags: ['Test'],
            instructor: instructorId,
            isActive: false,
            rating: 0
        }
    ]
}

/**
 * Generate random course data
 */
export function generateRandomCourse(instructorId, overrides = {}) {
    const randomNum = Math.floor(Math.random() * 10000)
    const levels = ['beginner', 'intermediate', 'advanced']
    const categories = ['Web Development', 'Programming', 'Data Science', 'Design']

    return {
        title: `Course ${randomNum}`,
        description: `Description for course ${randomNum}`,
        price: Math.floor(Math.random() * 5000) + 1000,
        category: categories[Math.floor(Math.random() * categories.length)],
        thumbnail: `https://example.com/thumbnails/course${randomNum}.jpg`,
        level: levels[Math.floor(Math.random() * levels.length)],
        tags: [`Tag${randomNum}`, 'Test'],
        instructor: instructorId,
        isActive: true,
        rating: Math.random() * 5,
        modules: [],
        ...overrides
    }
}
