# Test Suite Documentation

This directory contains the comprehensive test suite for the Premium LMS System.

## Directory Structure

```
tests/
├── e2e/                    # End-to-end tests with Playwright
├── seeds/                  # Database seed data
├── generators/             # Property-based test generators
├── utils/                  # Test utilities
└── README.md              # This file
```

## Running Tests

### Unit and Integration Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests

```bash
# Run e2e tests
pnpm test:e2e

# Run e2e tests with UI
pnpm test:e2e:ui
```

## Database Seeding

### Seed Test Database

```bash
# Seed the test database with sample data
pnpm seed

# Clear the test database
pnpm seed:clear
```

### Using Seeds in Tests

```javascript
import { seedAll, seedUsers, seedCourses } from '../seeds'
import { setupTestDB, teardownTestDB } from '../utils/testDb'

describe('My Test Suite', () => {
  beforeAll(async () => {
    await setupTestDB()
    await seedAll()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  // Your tests here
})
```

## Property-Based Testing

This project uses `fast-check` for property-based testing. Generators are available for:

- Users (`tests/generators/user.generator.js`)
- Courses (`tests/generators/course.generator.js`)
- Books (`tests/generators/book.generator.js`)

### Example Usage

```javascript
import fc from 'fast-check'
import { userArbitrary } from '../generators/user.generator'

test('user property test', () => {
  fc.assert(
    fc.property(userArbitrary, (user) => {
      // Your property test here
      expect(user.email).toMatch(/@/)
    }),
    { numRuns: 100 }
  )
})
```

## Test Data

### Seed Data

Pre-defined seed data is available for:

- **Users**: 5 users (1 admin, 3 active students, 1 inactive)
- **Courses**: 4 courses with modules, chapters, and lessons
- **Books**: 6 books with various categories and stock levels
- **Tests**: 3 mock tests with questions and sections

### Random Data Generators

Functions to generate random test data:

```javascript
import { generateRandomUser } from '../seeds/users.seed'
import { generateRandomCourse } from '../seeds/courses.seed'
import { generateRandomBook } from '../seeds/books.seed'

const user = generateRandomUser({ role: 'admin' })
const course = generateRandomCourse(instructorId)
const book = generateRandomBook({ stock: 100 })
```

## Test Utilities

### Database Utilities

```javascript
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  dropTestDB,
  setupTestDB,
  teardownTestDB
} from '../utils/testDb'
```

## Environment Variables

Create a `.env.test` file for test-specific environment variables:

```env
MONGODB_TEST_URI=mongodb://localhost:27017/lms-test
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key
RAZORPAY_KEY_ID=test-razorpay-key
RAZORPAY_KEY_SECRET=test-razorpay-secret
```

## Writing Tests

### Unit Tests

Place unit tests in `__tests__` directories next to the code being tested:

```
src/
├── lib/
│   ├── auth.js
│   └── __tests__/
│       └── auth.test.js
```

### Integration Tests

Place integration tests for API routes in `__tests__` directories:

```
src/
├── app/
│   └── api/
│       └── auth/
│           └── login/
│               ├── route.js
│               └── __tests__/
│                   └── route.test.js
```

### E2E Tests

Place e2e tests in the `tests/e2e` directory:

```
tests/
└── e2e/
    ├── auth.spec.js
    ├── navigation.spec.js
    └── books.spec.js
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after tests complete
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern in tests
5. **Mock External Services**: Mock external APIs and services
6. **Property-Based Tests**: Use property-based tests for universal properties
7. **Unit Tests**: Use unit tests for specific examples and edge cases

## Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Key API routes covered
- E2E Tests: Critical user flows covered
- Property-Based Tests: All correctness properties from design document

## Troubleshooting

### Tests Failing to Connect to Database

Ensure MongoDB is running and the connection string is correct in your environment variables.

### E2E Tests Timing Out

Increase the timeout in `playwright.config.js` or check if the development server is running.

### Property Tests Failing

Check the failing example provided by fast-check and adjust your generators or implementation accordingly.
