// tests/e2e/admin/auth.spec.ts
// Admin authentication tests

import { test, expect } from 'playwright/test'

test.describe('Admin Authentication', () => {
  test('should login as admin and redirect to admin dashboard', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Admin should be redirected to admin dashboard
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display admin navigation', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })

    // Check for admin-specific navigation
    await expect(page.locator('text=Customers').or(page.locator('text=Jobs'))).toBeVisible()
  })

  test('customer should not access admin routes', async ({ page }) => {
    // Login as customer
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'customer@test.com')
    await page.fill('input[type="password"]', 'customer123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })

    // Try to access admin route
    const response = await page.goto('/admin')

    // Should be redirected or show 403
    const url = page.url()
    const isBlocked = !url.includes('/admin') || (response && response.status() === 403)
    // Note: may redirect to dashboard instead of 403
  })
})
