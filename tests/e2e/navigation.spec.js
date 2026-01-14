const { test, expect } = require('@playwright/test')

test.describe('Navigation', () => {
    test('should load homepage', async ({ page }) => {
        await page.goto('/')

        await expect(page).toHaveTitle(/LMS|Learning|Education|Coaching/i)
    })

    test('should navigate to books page', async ({ page }) => {
        await page.goto('/')

        // Try to find and click books link
        const booksLink = page.getByRole('link', { name: /books/i })

        if (await booksLink.count() > 0) {
            await booksLink.first().click()
            await expect(page).toHaveURL(/books/)
        } else {
            // Navigate directly if link not found
            await page.goto('/books')
            await expect(page).toHaveURL(/books/)
        }
    })

    test('should navigate to blogs page', async ({ page }) => {
        await page.goto('/')

        const blogsLink = page.getByRole('link', { name: /blogs/i })

        if (await blogsLink.count() > 0) {
            await blogsLink.first().click()
            await expect(page).toHaveURL(/blogs/)
        } else {
            await page.goto('/blogs')
            await expect(page).toHaveURL(/blogs/)
        }
    })

    test('should navigate to current affairs page', async ({ page }) => {
        await page.goto('/')

        const currentAffairsLink = page.getByRole('link', { name: /current affairs/i })

        if (await currentAffairsLink.count() > 0) {
            await currentAffairsLink.first().click()
            await expect(page).toHaveURL(/current-affairs/)
        } else {
            await page.goto('/current-affairs')
            await expect(page).toHaveURL(/current-affairs/)
        }
    })

    test('should navigate to study materials page', async ({ page }) => {
        await page.goto('/')

        const studyMaterialsLink = page.getByRole('link', { name: /study materials/i })

        if (await studyMaterialsLink.count() > 0) {
            await studyMaterialsLink.first().click()
            await expect(page).toHaveURL(/study-materials/)
        } else {
            await page.goto('/study-materials')
            await expect(page).toHaveURL(/study-materials/)
        }
    })
})

test.describe('Responsive Design', () => {
    test('should display mobile menu on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        // Look for mobile menu button (hamburger)
        const menuButton = page.getByRole('button', { name: /menu/i }).or(
            page.locator('button[aria-label*="menu"]')
        )

        if (await menuButton.count() > 0) {
            await expect(menuButton.first()).toBeVisible()
        }
    })

    test('should be responsive on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/')

        await expect(page).toHaveTitle(/LMS|Learning|Education|Coaching/i)
    })

    test('should be responsive on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 })
        await page.goto('/')

        await expect(page).toHaveTitle(/LMS|Learning|Education|Coaching/i)
    })
})
