const { test, expect } = require('@playwright/test')

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should display login page', async ({ page }) => {
        await page.goto('/auth/login')

        await expect(page).toHaveTitle(/Login/i)
        await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
        await expect(page.getByLabel(/email/i)).toBeVisible()
        await expect(page.getByLabel(/password/i)).toBeVisible()
        await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
        await page.goto('/auth/login')

        await page.getByRole('button', { name: /login/i }).click()

        // Wait for validation messages
        await page.waitForTimeout(500)

        // Check if form is still on login page (not submitted)
        await expect(page).toHaveURL(/login/)
    })

    test('should display register page', async ({ page }) => {
        await page.goto('/auth/register')

        await expect(page).toHaveTitle(/Register/i)
        await expect(page.getByRole('heading', { name: /register/i })).toBeVisible()
        await expect(page.getByLabel(/email/i)).toBeVisible()
        await expect(page.getByLabel(/password/i)).toBeVisible()
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible()
    })

    test('should navigate between login and register', async ({ page }) => {
        await page.goto('/auth/login')

        // Look for link to register page
        const registerLink = page.getByRole('link', { name: /register/i }).or(
            page.getByRole('link', { name: /sign up/i })
        )

        if (await registerLink.count() > 0) {
            await registerLink.first().click()
            await expect(page).toHaveURL(/register/)
        }
    })

    test('should display forgot password page', async ({ page }) => {
        await page.goto('/auth/forgot-password')

        await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
        await expect(page.getByLabel(/email/i)).toBeVisible()
    })
})

test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
        await page.goto('/profile')

        // Should redirect to login or show unauthorized
        await page.waitForURL(/login|unauthorized/, { timeout: 5000 })

        const url = page.url()
        expect(url).toMatch(/login|unauthorized/)
    })

    test('should redirect to login when accessing admin route without auth', async ({ page }) => {
        await page.goto('/admin')

        // Should redirect to login or show unauthorized
        await page.waitForURL(/login|unauthorized/, { timeout: 5000 })

        const url = page.url()
        expect(url).toMatch(/login|unauthorized/)
    })
})
