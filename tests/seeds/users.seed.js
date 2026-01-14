/**
 * User Seed Data
 * Provides sample user data for testing
 */

export const userSeeds = [
    {
        email: 'admin@test.com',
        password: 'Admin@123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '9876543210',
        isActive: true,
        emailVerified: true,
        profile: {
            address: {
                street: '123 Admin Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400001',
                country: 'India'
            },
            education: 'Masters in Computer Science'
        }
    },
    {
        email: 'student1@test.com',
        password: 'Student@123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        phone: '9876543211',
        isActive: true,
        emailVerified: true,
        profile: {
            dateOfBirth: new Date('2000-01-15'),
            address: {
                street: '456 Student Lane',
                city: 'Delhi',
                state: 'Delhi',
                zipCode: '110001',
                country: 'India'
            },
            education: 'Bachelor of Science',
            parentDetails: {
                fatherName: 'Robert Doe',
                motherName: 'Jane Doe',
                guardianPhone: '9876543212',
                guardianEmail: 'parent@test.com'
            }
        }
    },
    {
        email: 'student2@test.com',
        password: 'Student@123',
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student',
        phone: '9876543213',
        isActive: true,
        emailVerified: true,
        profile: {
            dateOfBirth: new Date('1999-05-20'),
            address: {
                street: '789 Learning Road',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560001',
                country: 'India'
            },
            education: 'Bachelor of Arts'
        }
    },
    {
        email: 'student3@test.com',
        password: 'Student@123',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'student',
        phone: '9876543214',
        isActive: true,
        emailVerified: false,
        profile: {
            dateOfBirth: new Date('2001-08-10'),
            address: {
                street: '321 Study Avenue',
                city: 'Chennai',
                state: 'Tamil Nadu',
                zipCode: '600001',
                country: 'India'
            },
            education: 'High School'
        }
    },
    {
        email: 'inactive@test.com',
        password: 'Inactive@123',
        firstName: 'Inactive',
        lastName: 'User',
        role: 'student',
        phone: '9876543215',
        isActive: false,
        emailVerified: true
    }
]

/**
 * Generate random user data
 */
export function generateRandomUser(overrides = {}) {
    const randomNum = Math.floor(Math.random() * 10000)

    return {
        email: `user${randomNum}@test.com`,
        password: 'Test@123',
        firstName: `FirstName${randomNum}`,
        lastName: `LastName${randomNum}`,
        role: 'student',
        phone: `98765${String(randomNum).padStart(5, '0')}`,
        isActive: true,
        emailVerified: Math.random() > 0.5,
        ...overrides
    }
}
