/**
 * Property-Based Test Generators for Books
 * Uses fast-check to generate random book data
 */

import fc from 'fast-check'

/**
 * Generate book categories
 */
export const categoryArbitrary = fc.constantFrom(
    'Competitive Exams',
    'Academic',
    'Language',
    'General Knowledge',
    'Science',
    'Mathematics'
)

/**
 * Generate ISBN numbers
 */
export const isbnArbitrary = fc.integer({ min: 1000000000, max: 9999999999 })
    .map(n => `978-${n}`)

/**
 * Generate book languages
 */
export const languageArbitrary = fc.constantFrom('English', 'Hindi', 'Tamil', 'Telugu')

/**
 * Generate complete book object
 */
export const bookArbitrary = fc.record({
    title: fc.string({ minLength: 10, maxLength: 100 }),
    author: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 500 }),
    price: fc.integer({ min: 100, max: 2000 }),
    discountPrice: fc.option(fc.integer({ min: 50, max: 1500 }), { nil: undefined }),
    category: categoryArbitrary,
    subcategory: fc.option(fc.string({ minLength: 3, maxLength: 30 }), { nil: undefined }),
    images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    stock: fc.integer({ min: 0, max: 500 }),
    isbn: fc.option(isbnArbitrary, { nil: undefined }),
    tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    isNewArrival: fc.boolean(),
    isActive: fc.boolean(),
    publisher: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    pages: fc.option(fc.integer({ min: 50, max: 1000 }), { nil: undefined }),
    language: languageArbitrary,
    rating: fc.float({ min: 0, max: 5 }),
    reviewCount: fc.integer({ min: 0, max: 1000 }),
    soldCount: fc.integer({ min: 0, max: 5000 })
})

/**
 * Generate book with valid discount price
 */
export const bookWithDiscountArbitrary = fc.record({
    title: fc.string({ minLength: 10, maxLength: 100 }),
    author: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 500 }),
    price: fc.integer({ min: 100, max: 2000 }),
    category: categoryArbitrary,
    images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    stock: fc.integer({ min: 0, max: 500 }),
    tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    isNewArrival: fc.boolean(),
    isActive: fc.boolean(),
    language: languageArbitrary
}).chain(book =>
    fc.record({
        ...book,
        discountPrice: fc.option(
            fc.integer({ min: 50, max: book.price - 1 }),
            { nil: undefined }
        )
    })
)

/**
 * Generate array of books
 */
export const booksArrayArbitrary = fc.array(bookArbitrary, { minLength: 1, maxLength: 10 })

/**
 * Generate book search filters
 */
export const bookFiltersArbitrary = fc.record({
    category: fc.option(categoryArbitrary, { nil: undefined }),
    minPrice: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
    maxPrice: fc.option(fc.integer({ min: 1000, max: 5000 }), { nil: undefined }),
    isNewArrival: fc.option(fc.boolean(), { nil: undefined }),
    language: fc.option(languageArbitrary, { nil: undefined })
})
