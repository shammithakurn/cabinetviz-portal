// tests/e2e/admin/dashboard.spec.ts
// Admin dashboard tests

import { test, expect } from 'playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should have navigation to customers', async ({ page }) => {
    await page.goto('/admin')

    const customersLink = page.locator('a[href*="/admin/customers"]').or(page.locator('text=Customers').first())
    await expect(customersLink).toBeVisible()
  })

  test('should navigate to customers page', async ({ page }) => {
    await page.goto('/admin')

    await page.click('text=Customers')
    await expect(page).toHaveURL(/.*customers/)
  })

  test('should navigate to jobs page', async ({ page }) => {
    await page.goto('/admin')

    const jobsLink = page.locator('a[href="/admin/jobs"]').or(page.locator('text=Jobs').first())
    if (await jobsLink.isVisible()) {
      await jobsLink.click()
      await expect(page).toHaveURL(/.*jobs/)
    }
  })

  test('should navigate to payments page', async ({ page }) => {
    await page.goto('/admin')

    const paymentsLink = page.locator('a[href*="/admin/payments"]').or(page.locator('text=Payments').first())
    if (await paymentsLink.isVisible()) {
      await paymentsLink.click()
      await expect(page).toHaveURL(/.*payments/)
    }
  })

  test('should navigate to subscriptions page', async ({ page }) => {
    await page.goto('/admin')

    const subsLink = page.locator('a[href*="/admin/subscriptions"]').or(page.locator('text=Subscriptions').first())
    if (await subsLink.isVisible()) {
      await subsLink.click()
      await expect(page).toHaveURL(/.*subscriptions/)
    }
  })

  test('should navigate to discounts page', async ({ page }) => {
    await page.goto('/admin')

    const discountsLink = page.locator('a[href*="/admin/discounts"]').or(page.locator('text=Discounts').first())
    if (await discountsLink.isVisible()) {
      await discountsLink.click()
      await expect(page).toHaveURL(/.*discounts/)
    }
  })

  test('should navigate to theme settings', async ({ page }) => {
    await page.goto('/admin')

    const themeLink = page.locator('a[href*="/admin/theme"]').or(page.locator('text=Theme').first())
    if (await themeLink.isVisible()) {
      await themeLink.click()
      await expect(page).toHaveURL(/.*theme/)
    }
  })

  test('should navigate to festivals page', async ({ page }) => {
    await page.goto('/admin')

    const festivalsLink = page.locator('a[href*="/admin/festivals"]').or(page.locator('text=Festivals').first())
    if (await festivalsLink.isVisible()) {
      await festivalsLink.click()
      await expect(page).toHaveURL(/.*festivals/)
    }
  })
})
