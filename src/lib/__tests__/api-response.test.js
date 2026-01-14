import {
    ApiResponse,
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    serverErrorResponse,
    sendResponse,
} from '../api-response'

describe('API Response Utilities', () => {
    describe('ApiResponse Class', () => {
        test('should create success response', () => {
            const response = new ApiResponse(true, 'Success', { id: 1 })

            expect(response.success).toBe(true)
            expect(response.message).toBe('Success')
            expect(response.data).toEqual({ id: 1 })
            expect(response.errors).toBeNull()
            expect(response.timestamp).toBeDefined()
        })

        test('should create error response', () => {
            const response = new ApiResponse(false, 'Error', null, ['Error 1'])

            expect(response.success).toBe(false)
            expect(response.message).toBe('Error')
            expect(response.data).toBeNull()
            expect(response.errors).toEqual(['Error 1'])
        })
    })

    describe('successResponse', () => {
        test('should create success response with data', () => {
            const response = successResponse('Operation successful', { id: 1 })

            expect(response.success).toBe(true)
            expect(response.message).toBe('Operation successful')
            expect(response.data).toEqual({ id: 1 })
            expect(response.errors).toBeNull()
        })

        test('should create success response without data', () => {
            const response = successResponse('Operation successful')

            expect(response.success).toBe(true)
            expect(response.data).toBeNull()
        })
    })

    describe('errorResponse', () => {
        test('should create error response with errors', () => {
            const response = errorResponse('Operation failed', ['Error 1', 'Error 2'])

            expect(response.success).toBe(false)
            expect(response.message).toBe('Operation failed')
            expect(response.errors).toEqual(['Error 1', 'Error 2'])
            expect(response.data).toBeNull()
        })

        test('should create error response without errors', () => {
            const response = errorResponse('Operation failed')

            expect(response.success).toBe(false)
            expect(response.errors).toBeNull()
        })
    })

    describe('validationErrorResponse', () => {
        test('should create validation error response', () => {
            const errors = { email: 'Invalid email', password: 'Too short' }
            const response = validationErrorResponse(errors)

            expect(response.success).toBe(false)
            expect(response.message).toBe('Validation failed')
            expect(response.errors).toEqual(errors)
        })
    })

    describe('notFoundResponse', () => {
        test('should create not found response with default message', () => {
            const response = notFoundResponse()

            expect(response.success).toBe(false)
            expect(response.message).toBe('Resource not found')
        })

        test('should create not found response with custom resource', () => {
            const response = notFoundResponse('User')

            expect(response.success).toBe(false)
            expect(response.message).toBe('User not found')
        })
    })

    describe('unauthorizedResponse', () => {
        test('should create unauthorized response with default message', () => {
            const response = unauthorizedResponse()

            expect(response.success).toBe(false)
            expect(response.message).toBe('Unauthorized access')
        })

        test('should create unauthorized response with custom message', () => {
            const response = unauthorizedResponse('Invalid token')

            expect(response.success).toBe(false)
            expect(response.message).toBe('Invalid token')
        })
    })

    describe('forbiddenResponse', () => {
        test('should create forbidden response with default message', () => {
            const response = forbiddenResponse()

            expect(response.success).toBe(false)
            expect(response.message).toBe('Access forbidden')
        })

        test('should create forbidden response with custom message', () => {
            const response = forbiddenResponse('Admin access required')

            expect(response.success).toBe(false)
            expect(response.message).toBe('Admin access required')
        })
    })

    describe('serverErrorResponse', () => {
        test('should create server error response with default message', () => {
            const response = serverErrorResponse()

            expect(response.success).toBe(false)
            expect(response.message).toBe('Internal server error')
        })

        test('should create server error response with custom message', () => {
            const response = serverErrorResponse('Database connection failed')

            expect(response.success).toBe(false)
            expect(response.message).toBe('Database connection failed')
        })
    })

    describe('sendResponse', () => {
        test('should create Response with correct status and body', () => {
            // Mock Response.json
            global.Response = {
                json: jest.fn((body, init) => ({
                    status: init?.status || 200,
                    body,
                    json: async () => body
                }))
            }

            const apiResponse = successResponse('Test', { id: 1 })
            const response = sendResponse(null, 200, apiResponse)

            expect(response.status).toBe(200)
            expect(global.Response.json).toHaveBeenCalledWith(apiResponse, { status: 200 })

            // Cleanup
            delete global.Response
        })
    })
})
