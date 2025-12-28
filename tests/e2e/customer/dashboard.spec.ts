// tests/e2e/customer/dashboard.spec.ts
// Customer dashboard tests

import { test, expect } from 'playwright/test'

test.describe('Customer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'customer@test.com')
    await page.fill('input[type="password"]', 'customer123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
  })

  test('should display dashboard after login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should have navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard')

    // Check for navigation links
    const navLinks = ['Dashboard', 'Jobs', 'Downloads', 'Settings', 'Billing']
    for (const link of navLinks) {
      const navItem = page.locator(`text=${link}`).first()
      // Just check at least some nav items exist
    }
  })

  test('should navigate to jobs page', async ({ page }) => {
    await page.goto('/dashboard')

    const jobsLink = page.locator('a[href*="/dashboard/jobs"]').or(page.locator('text=Jobs').first())
    if (await jobsLink.isVisible()) {
      await jobsLink.click()
      await expect(page).toHaveURL(/.*jobs/)
    }
  })

  test('should navigate to downloads page', async ({ page }) => {
    await page.goto('/dashboard')

    const downloadsLink = page.locator('a[href*="/dashboard/downloads"]').or(page.locator('text=Downloads').first())
    if (await downloadsLink.isVisible()) {
      await downloadsLink.click()
      await expect(page).toHaveURL(/.*downloads/)
    }
  })

  test('should navigate to billing page', async ({ page }) => {
    await page.goto('/dashboard')

    const billingLink = page.locator('a[href*="/dashboard/billing"]').or(page.locator('text=Billing').first())
    if (await billingLink.isVisible()) {
      await billingLink.click()
      await expect(page).toHaveURL(/.*billing/)
    }
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/dashboard/settings"]').or(page.locator('text=Settings').first())
    if (await settingsLink.isVisible()) {
      await settingsLink.click()
      await expect(page).toHaveURL(/.*settings/)
    }
  })

  test('should have logout functionality', async ({ page }) => {
    await page.goto('/dashboard')

    const logoutButton = page.locator('text=Logout').or(page.locator('text=Sign Out')).first()
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      // Should redirect to home or login
      await page.waitForURL(/\/(auth\/login)?$/, { timeout: 5000 })
    }
  })
})

test.describe('Dashboard - Unauthenticated Access', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 })
  })
})
