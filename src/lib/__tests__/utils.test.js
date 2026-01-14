import {
    cn,
    formatCurrency,
    formatDate,
    generateSlug,
    isValidEmail,
    isValidPhone,
} from '../utils'

describe('Utility Functions', () => {
    describe('cn (className merger)', () => {
        test('should merge class names', () => {
            const result = cn('class1', 'class2')
            expect(result).toBe('class1 class2')
        })

        test('should handle conditional classes', () => {
            const result = cn('base', true && 'conditional', false && 'hidden')
            expect(result).toBe('base conditional')
        })

        test('should merge tailwind classes correctly', () => {
            const result = cn('px-2 py-1', 'px-4')
            expect(result).toBe('py-1 px-4')
        })
    })

    describe('formatCurrency', () => {
        test('should format INR currency', () => {
            const result = formatCurrency(1000)
            expect(result).toContain('1,000')
            expect(result).toContain('₹')
        })

        test('should format decimal amounts', () => {
            const result = formatCurrency(1234.56)
            expect(result).toContain('1,234.56')
        })

        test('should handle zero', () => {
            const result = formatCurrency(0)
            expect(result).toContain('0')
        })

        test('should handle large amounts', () => {
            const result = formatCurrency(1000000)
            expect(result).toContain('10,00,000')
        })
    })

    describe('formatDate', () => {
        test('should format date with default options', () => {
            const date = new Date('2024-01-15')
            const result = formatDate(date)

            expect(result).toContain('2024')
            expect(result).toContain('January')
            expect(result).toContain('15')
        })

        test('should format date with custom options', () => {
            const date = new Date('2024-01-15')
            const result = formatDate(date, { month: 'short', day: '2-digit' })

            expect(result).toContain('Jan')
            expect(result).toContain('15')
        })

        test('should handle date strings', () => {
            const result = formatDate('2024-01-15')
            expect(result).toBeDefined()
            expect(typeof result).toBe('string')
        })
    })

    describe('generateSlug', () => {
        test('should convert text to slug', () => {
            const result = generateSlug('Hello World')
            expect(result).toBe('hello-world')
        })

        test('should remove special characters', () => {
            const result = generateSlug('Hello @World! #Test')
            expect(result).toBe('hello-world-test')
        })

        test('should handle multiple spaces', () => {
            const result = generateSlug('Hello    World')
            expect(result).toBe('hello-world')
        })

        test('should remove leading and trailing hyphens', () => {
            const result = generateSlug('  Hello World  ')
            expect(result).toBe('hello-world')
        })

        test('should handle underscores', () => {
            const result = generateSlug('Hello_World_Test')
            expect(result).toBe('hello-world-test')
        })

        test('should handle empty string', () => {
            const result = generateSlug('')
            expect(result).toBe('')
        })
    })

    describe('isValidEmail', () => {
        test('should validate correct email', () => {
            expect(isValidEmail('test@example.com')).toBe(true)
            expect(isValidEmail('user.name@domain.co.in')).toBe(true)
            expect(isValidEmail('test+tag@example.com')).toBe(true)
        })

        test('should reject invalid email', () => {
            expect(isValidEmail('invalid')).toBe(false)
            expect(isValidEmail('invalid@')).toBe(false)
            expect(isValidEmail('@example.com')).toBe(false)
            expect(isValidEmail('test@')).toBe(false)
            expect(isValidEmail('test @example.com')).toBe(false)
        })

        test('should handle empty string', () => {
            expect(isValidEmail('')).toBe(false)
        })
    })

    describe('isValidPhone', () => {
        test('should validate correct Indian phone numbers', () => {
            expect(isValidPhone('9876543210')).toBe(true)
            expect(isValidPhone('8765432109')).toBe(true)
            expect(isValidPhone('7654321098')).toBe(true)
            expect(isValidPhone('6543210987')).toBe(true)
        })

        test('should reject invalid phone numbers', () => {
            expect(isValidPhone('1234567890')).toBe(false) // starts with 1
            expect(isValidPhone('5432109876')).toBe(false) // starts with 5
            expect(isValidPhone('987654321')).toBe(false) // too short
            expect(isValidPhone('98765432100')).toBe(false) // too long
            expect(isValidPhone('abcdefghij')).toBe(false) // non-numeric
        })

        test('should handle empty string', () => {
            expect(isValidPhone('')).toBe(false)
        })
    })
})
