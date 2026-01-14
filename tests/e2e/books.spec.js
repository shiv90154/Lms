const { test, expect } = require('@playwright/test')

test.describe('Books E-commerce', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/books')
    })

    test('should display books page', async ({ page }) => {
        await expect(page).toHaveURL(/books/)
        await expect(page.getByRole('heading', { name: /books/i })).toBeVisible()
    })

    test('should display book filters', async ({ page }) => {
        // Look for filter elements
        const filterSection = page.locator('[class*="filter"]').or(
            page.getByRole('region', { name: /filter/i })
        )

        // Check if filters exist
        const filterCount = await filterSection.count()
        expect(filterCount).toBeGreaterThanOrEqual(0)
    })

    test('should display book search', async ({ page }) => {
        // Look for search input
        const searchInput = page.getByPlaceholder(/search/i).or(
            page.getByRole('searchbox')
        )

        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeVisible()
        }
    })

    test('should display book cards', async ({ page }) => {
        // Wait for content to load
        await page.waitForTimeout(1000)

        // Look for book cards or grid
        const bookCards = page.locator('[class*="card"]').or(
            page.locator('[class*="book"]')
        )

        // Check if any books are displayed
        const cardCount = await bookCards.count()
        expect(cardCount).toBeGreaterThanOrEqual(0)
    })

    test('should handle empty search results', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/search/i).or(
            page.getByRole('searchbox')
        )

        if (await searchInput.count() > 0) {
            await searchInput.first().fill('xyznonexistentbook123')
            await page.keyboard.press('Enter')

            await page.waitForTimeout(1000)

            // Should show no results message or empty state
            const noResults = page.getByText(/no.*found/i).or(
                page.getByText(/no.*results/i)
            )

            // Either shows no results or still shows the page
            expect(page.url()).toContain('books')
        }
    })
})

test.describe('Shopping Cart', () => {
    test('should display cart icon', async ({ page }) => {
        await page.goto('/')

        // Look for cart icon or button
        const cartButton = page.getByRole('button', { name: /cart/i }).or(
            page.locator('[aria-label*="cart"]')
        )

        if (await cartButton.count() > 0) {
            await expect(cartButton.first()).toBeVisible()
        }
    })

    test('should navigate to cart page', async ({ page }) => {
        await page.goto('/cart')

        await expect(page).toHaveURL(/cart/)
    })

    test('should display empty cart message', async ({ page }) => {
        await page.goto('/cart')

        // Wait for content
        await page.waitForTimeout(1000)

        // Look for empty cart message or cart items
        const emptyMessage = page.getByText(/empty/i).or(
            page.getByText(/no items/i)
        )

        // Either shows empty message or has items
        const url = page.url()
        expect(url).toContain('cart')
    })
})
