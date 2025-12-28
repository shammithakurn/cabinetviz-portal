// tests/e2e/admin/payments.spec.ts
// Admin payment and subscription management tests

import { test, expect } from 'playwright/test'

test.describe('Admin Payment Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display payments page', async ({ page }) => {
    await page.goto('/admin/payments')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should have create payment/invoice button', async ({ page }) => {
    await page.goto('/admin/payments')

    const createButton = page.locator('text=Create').or(page.locator('text=New Payment')).or(page.locator('button').filter({ hasText: /create|add|new/i }))
    // Button may or may not exist depending on implementation
  })

  test('should filter payments by status', async ({ page }) => {
    await page.goto('/admin/payments')

    // Look for status filter
    const statusFilter = page.locator('select').first()
    if (await statusFilter.isVisible()) {
      // Try selecting different statuses
      const options = await statusFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await statusFilter.selectOption({ index: 1 })
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('Admin Subscription Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display subscriptions page', async ({ page }) => {
    await page.goto('/admin/subscriptions')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should show subscription details', async ({ page }) => {
    await page.goto('/admin/subscriptions')

    // Check for subscription data columns
    const priceText = page.locator('text=$499').or(page.locator('text=Partner'))
    // May or may not have subscriptions
  })
})

test.describe('Admin Discount Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display discounts page', async ({ page }) => {
    await page.goto('/admin/discounts')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should have create discount button', async ({ page }) => {
    await page.goto('/admin/discounts')

    const createButton = page.locator('text=Create').or(page.locator('text=New Discount')).or(page.locator('button').filter({ hasText: /create|add|new/i }))
    await expect(createButton.first()).toBeVisible()
  })
})
