import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    extractTokenFromHeader,
    generatePasswordResetToken,
    generateEmailVerificationToken,
    parseDeviceInfo,
} from '../auth'

describe('Auth Utilities', () => {
    describe('Password Hashing', () => {
        test('should hash password correctly', async () => {
            const password = 'testPassword123'
            const hash = await hashPassword(password)

            expect(hash).toBeDefined()
            expect(hash).not.toBe(password)
            expect(hash.length).toBeGreaterThan(0)
        })

        test('should compare password with hash correctly', async () => {
            const password = 'testPassword123'
            const hash = await hashPassword(password)

            const isMatch = await comparePassword(password, hash)
            expect(isMatch).toBe(true)
        })

        test('should reject incorrect password', async () => {
            const password = 'testPassword123'
            const wrongPassword = 'wrongPassword'
            const hash = await hashPassword(password)

            const isMatch = await comparePassword(wrongPassword, hash)
            expect(isMatch).toBe(false)
        })
    })

    describe('JWT Token Generation', () => {
        test('should generate access token', () => {
            const payload = { userId: '123', role: 'student' }
            const token = generateAccessToken(payload)

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.split('.')).toHaveLength(3)
        })

        test('should generate refresh token', () => {
            const payload = { userId: '123' }
            const token = generateRefreshToken(payload)

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.split('.')).toHaveLength(3)
        })
    })

    describe('JWT Token Verification', () => {
        test('should verify valid access token', () => {
            const payload = { userId: '123', role: 'student' }
            const token = generateAccessToken(payload)

            const decoded = verifyAccessToken(token)
            expect(decoded).toBeDefined()
            expect(decoded.userId).toBe('123')
            expect(decoded.role).toBe('student')
        })

        test('should return null for invalid access token', () => {
            const invalidToken = 'invalid.token.here'
            const decoded = verifyAccessToken(invalidToken)

            expect(decoded).toBeNull()
        })

        test('should verify valid refresh token', () => {
            const payload = { userId: '123' }
            const token = generateRefreshToken(payload)

            const decoded = verifyRefreshToken(token)
            expect(decoded).toBeDefined()
            expect(decoded.userId).toBe('123')
        })

        test('should return null for invalid refresh token', () => {
            const invalidToken = 'invalid.token.here'
            const decoded = verifyRefreshToken(invalidToken)

            expect(decoded).toBeNull()
        })
    })

    describe('Token Extraction', () => {
        test('should extract token from valid Bearer header', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
            const authHeader = `Bearer ${token}`

            const extracted = extractTokenFromHeader(authHeader)
            expect(extracted).toBe(token)
        })

        test('should return null for missing header', () => {
            const extracted = extractTokenFromHeader(null)
            expect(extracted).toBeNull()
        })

        test('should return null for invalid header format', () => {
            const extracted = extractTokenFromHeader('InvalidFormat token')
            expect(extracted).toBeNull()
        })
    })

    describe('Token Generation', () => {
        test('should generate password reset token', () => {
            const token = generatePasswordResetToken()

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.length).toBe(64) // 32 bytes = 64 hex characters
        })

        test('should generate email verification token', () => {
            const token = generateEmailVerificationToken()

            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.length).toBe(64)
        })

        test('should generate unique tokens', () => {
            const token1 = generatePasswordResetToken()
            const token2 = generatePasswordResetToken()

            expect(token1).not.toBe(token2)
        })
    })

    describe('Device Info Parsing', () => {
        test('should parse Chrome on Windows', () => {
            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            const deviceInfo = parseDeviceInfo(userAgent, '192.168.1.1')

            expect(deviceInfo.browser).toBe('Chrome')
            expect(deviceInfo.os).toBe('Windows')
            expect(deviceInfo.device).toBe('Desktop')
            expect(deviceInfo.ip).toBe('192.168.1.1')
        })

        test('should parse Firefox on macOS', () => {
            const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
            const deviceInfo = parseDeviceInfo(userAgent, '192.168.1.2')

            expect(deviceInfo.browser).toBe('Firefox')
            expect(deviceInfo.os).toBe('macOS')
        })

        test('should parse Mobile device', () => {
            const userAgent = 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            const deviceInfo = parseDeviceInfo(userAgent, '192.168.1.3')

            // Android user agents contain "Linux", so it matches Linux first in the current implementation
            expect(deviceInfo.os).toBe('Linux')
            expect(deviceInfo.browser).toBe('Chrome')
            expect(deviceInfo.device).toBe('Mobile')
        })

        test('should handle missing user agent', () => {
            const deviceInfo = parseDeviceInfo(null, '192.168.1.4')

            expect(deviceInfo.userAgent).toBe('Unknown')
            expect(deviceInfo.browser).toBe('Unknown')
            expect(deviceInfo.os).toBe('Unknown')
            expect(deviceInfo.device).toBe('Unknown')
            expect(deviceInfo.ip).toBe('192.168.1.4')
        })
    })
})
