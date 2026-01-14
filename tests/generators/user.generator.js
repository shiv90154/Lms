/**
 * Property-Based Test Generators for Users
 * Uses fast-check to generate random user data
 */

import fc from 'fast-check'

/**
 * Generate valid email addresses
 */
export const emailArbitrary = fc.emailAddress()

/**
 * Generate valid passwords (min 6 chars, with special chars)
 */
export const passwordArbitrary = fc.string({ minLength: 6, maxLength: 20 })
    .filter(s => /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s))

/**
 * Generate valid names
 */
export const nameArbitrary = fc.string({ minLength: 2, maxLength: 50 })
    .filter(s => /^[a-zA-Z\s]+$/.test(s))

/**
 * Generate valid Indian phone numbers
 */
export const phoneArbitrary = fc.integer({ min: 6000000000, max: 9999999999 })
    .map(n => n.toString())

/**
 * Generate user roles
 */
export const roleArbitrary = fc.constantFrom('student', 'admin')

/**
 * Generate complete user object
 */
export const userArbitrary = fc.record({
    email: emailArbitrary,
    password: passwordArbitrary,
    firstName: nameArbitrary,
    lastName: nameArbitrary,
    phone: fc.option(phoneArbitrary, { nil: undefined }),
    role: roleArbitrary,
    isActive: fc.boolean(),
    emailVerified: fc.boolean()
})

/**
 * Generate user with profile
 */
export const userWithProfileArbitrary = fc.record({
    email: emailArbitrary,
    password: passwordArbitrary,
    firstName: nameArbitrary,
    lastName: nameArbitrary,
    phone: fc.option(phoneArbitrary, { nil: undefined }),
    role: roleArbitrary,
    isActive: fc.boolean(),
    emailVerified: fc.boolean(),
    profile: fc.record({
        dateOfBirth: fc.date({ min: new Date('1950-01-01'), max: new Date('2010-12-31') }),
        address: fc.record({
            street: fc.string({ minLength: 5, maxLength: 100 }),
            city: fc.string({ minLength: 3, maxLength: 50 }),
            state: fc.string({ minLength: 3, maxLength: 50 }),
            zipCode: fc.string({ minLength: 6, maxLength: 6 }),
            country: fc.constant('India')
        }),
        education: fc.string({ minLength: 5, maxLength: 100 })
    })
})

/**
 * Generate array of users
 */
export const usersArrayArbitrary = fc.array(userArbitrary, { minLength: 1, maxLength: 10 })
