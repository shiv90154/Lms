/**
 * Test Database Utilities
 * Provides setup and teardown functions for test database
 */

import mongoose from 'mongoose'

let isConnected = false

/**
 * Connect to test database
 */
export async function connectTestDB() {
    if (isConnected) {
        return
    }

    const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms-test'

    try {
        await mongoose.connect(MONGODB_URI)
        isConnected = true
        console.log('Connected to test database')
    } catch (error) {
        console.error('Error connecting to test database:', error)
        throw error
    }
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDB() {
    if (!isConnected) {
        return
    }

    try {
        await mongoose.disconnect()
        isConnected = false
        console.log('Disconnected from test database')
    } catch (error) {
        console.error('Error disconnecting from test database:', error)
        throw error
    }
}

/**
 * Clear all collections in test database
 */
export async function clearTestDB() {
    if (!isConnected) {
        await connectTestDB()
    }

    const collections = mongoose.connection.collections

    for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany({})
    }

    console.log('Cleared all test database collections')
}

/**
 * Drop test database
 */
export async function dropTestDB() {
    if (!isConnected) {
        await connectTestDB()
    }

    await mongoose.connection.dropDatabase()
    console.log('Dropped test database')
}

/**
 * Setup test database (connect and clear)
 */
export async function setupTestDB() {
    await connectTestDB()
    await clearTestDB()
}

/**
 * Teardown test database (clear and disconnect)
 */
export async function teardownTestDB() {
    await clearTestDB()
    await disconnectTestDB()
}
