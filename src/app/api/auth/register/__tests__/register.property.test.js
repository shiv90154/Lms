import * as fc from 'fast-check';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hashPassword, generateAccessToken, generateRefreshToken } from '../../../../../lib/auth.js';

/**
 * Property-Based Test for User Registration
 * Feature: premium-lms-system, Property 1: Registration creates secure credentials
 * Validates: Requirements 1.1
 * 
 * This test verifies that for any valid user registration data,
 * the system creates a bcrypt-hashed password and generates a valid JWT token.
 */

describe('User Registration Property Tests', () => {

    /**
     * Property 1: Registration creates secure credentials
     * For any valid user registration data (email, password), 
     * the authentication system should create a bcrypt-hashed password 
     * and generate a valid JWT token
     */
    test('Property 1: Registration creates secure credentials', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate random valid user data
                fc.record({
                    email: fc.emailAddress(),
                    password: fc.string({ minLength: 6, maxLength: 50 }),
                    firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    userId: fc.uuid(),
                    role: fc.constantFrom('student', 'admin')
                }),
                async (userData) => {
                    // Property 1a: Password should be hashed using bcrypt
                    const hashedPassword = await hashPassword(userData.password);

                    expect(hashedPassword).toBeDefined();
                    expect(hashedPassword).not.toBe(userData.password);
                    expect(hashedPassword.length).toBeGreaterThan(userData.password.length);

                    // Property 1b: Hashed password should be a valid bcrypt hash
                    // Bcrypt hashes start with $2a$, $2b$, or $2y$ and have specific format
                    expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);

                    // Property 1c: Password should be verifiable with bcrypt
                    const isPasswordValid = await bcrypt.compare(userData.password, hashedPassword);
                    expect(isPasswordValid).toBe(true);

                    // Property 1d: Wrong password should not verify
                    const wrongPassword = userData.password + 'wrong';
                    const isWrongPasswordValid = await bcrypt.compare(wrongPassword, hashedPassword);
                    expect(isWrongPasswordValid).toBe(false);

                    // Property 1e: System should generate valid JWT access token
                    const tokenPayload = {
                        userId: userData.userId,
                        email: userData.email,
                        role: userData.role
                    };
                    const accessToken = generateAccessToken(tokenPayload);

                    expect(accessToken).toBeDefined();
                    expect(typeof accessToken).toBe('string');
                    expect(accessToken.split('.')).toHaveLength(3); // JWT has 3 parts

                    // Property 1f: Access token should be verifiable and contain correct user data
                    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
                    expect(decodedAccessToken.userId).toBe(userData.userId);
                    expect(decodedAccessToken.email).toBe(userData.email);
                    expect(decodedAccessToken.role).toBe(userData.role);

                    // Property 1g: System should generate valid JWT refresh token
                    const refreshToken = generateRefreshToken(tokenPayload);

                    expect(refreshToken).toBeDefined();
                    expect(typeof refreshToken).toBe('string');
                    expect(refreshToken.split('.')).toHaveLength(3);

                    // Property 1h: Refresh token should be verifiable
                    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    expect(decodedRefreshToken.userId).toBe(userData.userId);
                    expect(decodedRefreshToken.email).toBe(userData.email);
                    expect(decodedRefreshToken.role).toBe(userData.role);
                }
            ),
            { numRuns: 20 } // Run 20 iterations (reduced from 100 due to bcrypt performance)
        );
    }, 120000); // 120 second timeout for property test (bcrypt is computationally expensive)
});
