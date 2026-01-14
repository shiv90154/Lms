/**
 * Property-Based Test Generators for Courses
 * Uses fast-check to generate random course data
 */

import fc from 'fast-check'

/**
 * Generate course levels
 */
export const levelArbitrary = fc.constantFrom('beginner', 'intermediate', 'advanced')

/**
 * Generate course categories
 */
export const categoryArbitrary = fc.constantFrom(
    'Web Development',
    'Programming',
    'Data Science',
    'Design',
    'Business',
    'Marketing'
)

/**
 * Generate lesson types
 */
export const lessonTypeArbitrary = fc.constantFrom('video', 'pdf', 'text')

/**
 * Generate lesson object
 */
export const lessonArbitrary = fc.record({
    title: fc.string({ minLength: 5, maxLength: 100 }),
    type: lessonTypeArbitrary,
    content: fc.webUrl(),
    duration: fc.integer({ min: 5, max: 120 }),
    order: fc.integer({ min: 1, max: 100 }),
    isLocked: fc.boolean(),
    description: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined })
})

/**
 * Generate chapter object
 */
export const chapterArbitrary = fc.record({
    title: fc.string({ minLength: 5, maxLength: 100 }),
    order: fc.integer({ min: 1, max: 50 }),
    lessons: fc.array(lessonArbitrary, { minLength: 1, maxLength: 5 }),
    description: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined })
})

/**
 * Generate module object
 */
export const moduleArbitrary = fc.record({
    title: fc.string({ minLength: 5, maxLength: 100 }),
    order: fc.integer({ min: 1, max: 20 }),
    chapters: fc.array(chapterArbitrary, { minLength: 1, maxLength: 3 }),
    description: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined })
})

/**
 * Generate complete course object
 */
export const courseArbitrary = fc.record({
    title: fc.string({ minLength: 10, maxLength: 100 }),
    description: fc.string({ minLength: 20, maxLength: 500 }),
    price: fc.integer({ min: 0, max: 10000 }),
    category: categoryArbitrary,
    thumbnail: fc.webUrl(),
    level: levelArbitrary,
    tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    isActive: fc.boolean(),
    rating: fc.float({ min: 0, max: 5 })
})

/**
 * Generate course with modules
 */
export const courseWithModulesArbitrary = fc.record({
    title: fc.string({ minLength: 10, maxLength: 100 }),
    description: fc.string({ minLength: 20, maxLength: 500 }),
    price: fc.integer({ min: 0, max: 10000 }),
    category: categoryArbitrary,
    thumbnail: fc.webUrl(),
    level: levelArbitrary,
    tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    modules: fc.array(moduleArbitrary, { minLength: 1, maxLength: 3 }),
    isActive: fc.boolean(),
    rating: fc.float({ min: 0, max: 5 })
})

/**
 * Generate array of courses
 */
export const coursesArrayArbitrary = fc.array(courseArbitrary, { minLength: 1, maxLength: 10 })
