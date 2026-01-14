/**
 * Main Seeder
 * Seeds the test database with sample data
 */

import { connectTestDB, clearTestDB, disconnectTestDB } from '../utils/testDb.js'
import User from '../../src/models/User.js'
import Course from '../../src/models/Course.js'
import Book from '../../src/models/Book.js'
import MockTest from '../../src/models/MockTest.js'
import { userSeeds } from './users.seed.js'
import { generateCourseSeeds } from './courses.seed.js'
import { bookSeeds } from './books.seed.js'
import { testSeeds } from './tests.seed.js'

/**
 * Seed users
 */
export async function seedUsers() {
    console.log('Seeding users...')
    const users = await User.insertMany(userSeeds)
    console.log(`✓ Seeded ${users.length} users`)
    return users
}

/**
 * Seed courses
 */
export async function seedCourses(instructorId) {
    console.log('Seeding courses...')
    const courseData = generateCourseSeeds(instructorId)
    const courses = await Course.insertMany(courseData)
    console.log(`✓ Seeded ${courses.length} courses`)
    return courses
}

/**
 * Seed books
 */
export async function seedBooks() {
    console.log('Seeding books...')
    const books = await Book.insertMany(bookSeeds)
    console.log(`✓ Seeded ${books.length} books`)
    return books
}

/**
 * Seed mock tests
 */
export async function seedTests() {
    console.log('Seeding mock tests...')
    const tests = await MockTest.insertMany(testSeeds)
    console.log(`✓ Seeded ${tests.length} mock tests`)
    return tests
}

/**
 * Seed all data
 */
export async function seedAll() {
    try {
        await connectTestDB()
        await clearTestDB()

        console.log('Starting database seeding...\n')

        // Seed users first
        const users = await seedUsers()

        // Find admin user for courses
        const admin = users.find(u => u.role === 'admin')

        // Seed courses with admin as instructor
        const courses = await seedCourses(admin._id)

        // Seed books
        const books = await seedBooks()

        // Seed tests
        const tests = await seedTests()

        console.log('\n✓ Database seeding completed successfully!')
        console.log(`\nSeeded data summary:`)
        console.log(`  - Users: ${users.length}`)
        console.log(`  - Courses: ${courses.length}`)
        console.log(`  - Books: ${books.length}`)
        console.log(`  - Tests: ${tests.length}`)

        return {
            users,
            courses,
            books,
            tests
        }
    } catch (error) {
        console.error('Error seeding database:', error)
        throw error
    }
}

/**
 * Run seeder if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    seedAll()
        .then(() => {
            console.log('\nDisconnecting from database...')
            return disconnectTestDB()
        })
        .then(() => {
            console.log('Done!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('Seeding failed:', error)
            process.exit(1)
        })
}
