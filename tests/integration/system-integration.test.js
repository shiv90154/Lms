/**
 * System Integration Tests
 * Tests the integration of major system components and workflows
 */

import { connectTestDB, disconnectTestDB, clearTestDB } from '../utils/testDb';
import User from '../../src/models/User';
import Course from '../../src/models/Course';
import Book from '../../src/models/Book';
import Cart from '../../src/models/Cart';
import Order from '../../src/models/Order';
import MockTest from '../../src/models/MockTest';
import TestAttempt from '../../src/models/TestAttempt';
import Enrollment from '../../src/models/Enrollment';

describe('System Integration Tests', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        // Clean up test data before each test
        await clearTestDB();
    });

    describe('Authentication and User Management Flow', () => {
        test('should complete full user registration and login flow', async () => {
            // Create a new user
            const userData = {
                email: 'test.user@integration.test',
                password: 'SecurePassword123!',
                firstName: 'Test',
                lastName: 'User',
                role: 'student'
            };

            const user = await User.create(userData);
            expect(user).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(user.password).not.toBe(userData.password); // Should be hashed

            // Verify password comparison works
            const isPasswordValid = await user.comparePassword(userData.password);
            expect(isPasswordValid).toBe(true);

            // Generate tokens
            const { accessToken, refreshToken } = user.generateTokens();
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();

            // Add refresh token
            await user.addRefreshToken(refreshToken, JSON.stringify({ device: 'test' }));
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.refreshTokens.length).toBe(1);
        });

        test('should handle user profile updates', async () => {
            const user = await User.create({
                email: 'test.profile@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Profile',
                role: 'student'
            });

            // Update profile
            user.profile = {
                avatar: 'https://example.com/avatar.jpg',
                dateOfBirth: new Date('2000-01-01'),
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345'
                }
            };

            await user.save();

            const updatedUser = await User.findById(user._id);
            expect(updatedUser.profile.avatar).toBe('https://example.com/avatar.jpg');
            expect(updatedUser.profile.address.city).toBe('Test City');
        });
    });

    describe('Course Enrollment and Progress Flow', () => {
        test('should complete full course enrollment and progress tracking', async () => {
            // Create a student
            const student = await User.create({
                email: 'test.student@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Student',
                role: 'student'
            });

            // Create a course
            const course = await Course.create({
                title: 'Integration Test Course',
                description: 'Test course for integration testing',
                price: 999,
                category: 'Test',
                level: 'beginner',
                isActive: true,
                modules: [
                    {
                        title: 'Module 1',
                        order: 1,
                        chapters: [
                            {
                                title: 'Chapter 1',
                                order: 1,
                                lessons: [
                                    {
                                        title: 'Lesson 1',
                                        type: 'video',
                                        content: 'https://youtube.com/watch?v=test',
                                        duration: 600,
                                        order: 1,
                                        isLocked: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // Create enrollment
            const enrollment = await Enrollment.create({
                userId: student._id,
                courseId: course._id,
                amount: course.price,
                paymentStatus: 'completed',
                isActive: true
            });

            expect(enrollment).toBeDefined();
            expect(enrollment.paymentStatus).toBe('completed');

            // Verify enrollment is valid
            expect(enrollment.isValid()).toBe(true);
        });
    });

    describe('E-commerce Flow: Cart to Order', () => {
        test('should complete full e-commerce flow from cart to order', async () => {
            // Create a student
            const student = await User.create({
                email: 'test.buyer@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Buyer',
                role: 'student'
            });

            // Create books
            const book1 = await Book.create({
                title: 'Integration Test Book 1',
                author: 'Test Author',
                description: 'Test book 1',
                price: 299,
                category: 'Test',
                stock: 10,
                isbn: '1234567890123',
                isActive: true
            });

            const book2 = await Book.create({
                title: 'Integration Test Book 2',
                author: 'Test Author',
                description: 'Test book 2',
                price: 399,
                category: 'Test',
                stock: 5,
                isbn: '1234567890124',
                isActive: true
            });

            // Create cart
            const cart = await Cart.create({
                userId: student._id,
                items: [
                    {
                        bookId: book1._id,
                        quantity: 2,
                        price: book1.price
                    },
                    {
                        bookId: book2._id,
                        quantity: 1,
                        price: book2.price
                    }
                ]
            });

            // Calculate totals
            await cart.calculateTotals();
            expect(cart.totalAmount).toBe(299 * 2 + 399);
            expect(cart.itemCount).toBe(3);

            // Create order from cart
            const shippingAddress = {
                fullName: 'Test Buyer',
                phone: '9876543210',
                email: 'test.buyer@integration.test',
                addressLine1: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'India'
            };

            const order = await Order.createFromCart(
                student._id,
                cart.items,
                shippingAddress,
                { razorpayOrderId: 'test_order_123' }
            );

            expect(order).toBeDefined();
            expect(order.items.length).toBe(2);
            expect(order.totalAmount).toBe(cart.totalAmount);
            expect(order.orderStatus).toBe('pending');
            expect(order.paymentStatus).toBe('pending');
        });

        test('should handle order payment completion', async () => {
            const student = await User.create({
                email: 'test.payment@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Payment',
                role: 'student'
            });

            const book = await Book.create({
                title: 'Integration Test Book Payment',
                author: 'Test Author',
                description: 'Test book',
                price: 499,
                category: 'Test',
                stock: 10,
                isbn: '1234567890125',
                isActive: true
            });

            const order = await Order.create({
                userId: student._id,
                items: [{
                    bookId: book._id,
                    title: book.title,
                    quantity: 1,
                    price: book.price
                }],
                totalAmount: 499,
                shippingAddress: {
                    fullName: 'Test Payment',
                    phone: '9876543210',
                    email: 'test.payment@integration.test',
                    addressLine1: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'India'
                },
                razorpayOrderId: 'test_order_payment_123',
                orderStatus: 'pending',
                paymentStatus: 'pending'
            });

            // Complete payment
            order.paymentStatus = 'completed';
            order.razorpayPaymentId = 'test_payment_123';
            order.orderStatus = 'processing';
            await order.save();

            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.paymentStatus).toBe('completed');
            expect(updatedOrder.orderStatus).toBe('processing');
        });
    });

    describe('Assessment System Flow', () => {
        test('should complete full mock test flow', async () => {
            // Create a student
            const student = await User.create({
                email: 'test.taker@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Taker',
                role: 'student'
            });

            // Create a mock test
            const mockTest = await MockTest.create({
                title: 'Integration Test Mock Test',
                description: 'Test mock test',
                duration: 60,
                totalMarks: 100,
                negativeMarking: 0.25,
                instructions: ['Read carefully', 'No cheating'],
                sections: [
                    {
                        title: 'Section 1',
                        questions: [
                            {
                                text: 'What is 2+2?',
                                options: ['3', '4', '5', '6'],
                                correctAnswer: 1,
                                explanation: '2+2 equals 4',
                                marks: 4,
                                difficulty: 'easy',
                                subject: 'Math'
                            },
                            {
                                text: 'What is 3+3?',
                                options: ['5', '6', '7', '8'],
                                correctAnswer: 1,
                                explanation: '3+3 equals 6',
                                marks: 4,
                                difficulty: 'easy',
                                subject: 'Math'
                            }
                        ]
                    }
                ],
                isActive: true
            });

            // Create test attempt
            const testAttempt = await TestAttempt.create({
                userId: student._id,
                testId: mockTest._id,
                answers: [
                    {
                        questionId: mockTest.sections[0].questions[0]._id,
                        selectedAnswer: 1,
                        isCorrect: true,
                        marksAwarded: 4
                    },
                    {
                        questionId: mockTest.sections[0].questions[1]._id,
                        selectedAnswer: 0,
                        isCorrect: false,
                        marksAwarded: -1
                    }
                ],
                score: 3,
                timeSpent: 1800,
                status: 'completed'
            });

            expect(testAttempt).toBeDefined();
            expect(testAttempt.score).toBe(3);
            expect(testAttempt.status).toBe('completed');
        });
    });

    describe('Admin Operations Flow', () => {
        test('should handle admin user operations', async () => {
            // Create admin user
            const admin = await User.create({
                email: 'test.admin@integration.test',
                password: 'AdminPassword123!',
                firstName: 'Test',
                lastName: 'Admin',
                role: 'admin'
            });

            expect(admin.role).toBe('admin');

            // Admin creates a course
            const course = await Course.create({
                title: 'Integration Test Admin Course',
                description: 'Course created by admin',
                price: 1999,
                category: 'Test',
                level: 'advanced',
                isActive: true,
                createdBy: admin._id
            });

            expect(course).toBeDefined();
            expect(course.createdBy.toString()).toBe(admin._id.toString());

            // Admin creates a book
            const book = await Book.create({
                title: 'Integration Test Admin Book',
                author: 'Admin Author',
                description: 'Book created by admin',
                price: 599,
                category: 'Test',
                stock: 20,
                isbn: '1234567890126',
                isActive: true
            });

            expect(book).toBeDefined();
            expect(book.stock).toBe(20);
        });
    });

    describe('Cross-Component Integration', () => {
        test('should handle user purchasing book and enrolling in course', async () => {
            // Create student
            const student = await User.create({
                email: 'test.multi@integration.test',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'Multi',
                role: 'student'
            });

            // Create course
            const course = await Course.create({
                title: 'Integration Test Multi Course',
                description: 'Test course',
                price: 1499,
                category: 'Test',
                level: 'intermediate',
                isActive: true
            });

            // Create book
            const book = await Book.create({
                title: 'Integration Test Multi Book',
                author: 'Test Author',
                description: 'Test book',
                price: 399,
                category: 'Test',
                stock: 10,
                isbn: '1234567890127',
                isActive: true
            });

            // Student enrolls in course
            const enrollment = await Enrollment.create({
                userId: student._id,
                courseId: course._id,
                amount: course.price,
                paymentStatus: 'completed',
                isActive: true
            });

            // Student purchases book
            const order = await Order.create({
                userId: student._id,
                items: [{
                    bookId: book._id,
                    title: book.title,
                    quantity: 1,
                    price: book.price
                }],
                totalAmount: 399,
                shippingAddress: {
                    fullName: 'Test Multi',
                    phone: '9876543210',
                    email: 'test.multi@integration.test',
                    addressLine1: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'India'
                },
                razorpayOrderId: 'test_order_multi_123',
                orderStatus: 'processing',
                paymentStatus: 'completed'
            });

            // Verify both operations succeeded
            expect(enrollment.isValid()).toBe(true);
            expect(order.paymentStatus).toBe('completed');

            // Verify student has both enrollment and order
            const studentEnrollments = await Enrollment.find({ userId: student._id });
            const studentOrders = await Order.find({ userId: student._id });

            expect(studentEnrollments.length).toBe(1);
            expect(studentOrders.length).toBe(1);
        });
    });
});
