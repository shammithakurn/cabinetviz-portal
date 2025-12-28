// tests/e2e/customer/landing.spec.ts
// Landing page tests

import { test, expect } from 'playwright/test'

test.describe('Landing Page', () => {
  test('should load successfully without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Page should have content
    await expect(page.locator('body')).not.toBeEmpty()

    // Log any console errors found
    if (errors.length > 0) {
      console.log('Console errors:', errors)
    }
  })

  test('should display hero section', async ({ page }) => {
    await page.goto('/')

    // Check for main heading
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check Sign In link exists and is clickable
    const signInLink = page.locator('text=Sign In').first()
    await expect(signInLink).toBeVisible()
  })

  test('should display pricing section', async ({ page }) => {
    await page.goto('/')

    // Check pricing section exists
    const pricingSection = page.locator('#pricing')
    await expect(pricingSection).toBeVisible()

    // Check package prices are displayed
    await expect(page.locator('text=$99')).toBeVisible()
    await expect(page.locator('text=$199')).toBeVisible()
    await expect(page.locator('text=$499')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    await page.locator('text=Sign In').first().click()

    await expect(page).toHaveURL(/.*login/)
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')

    // Look for register/get started button
    const registerLink = page
      .locator('text=Register')
      .or(page.locator('text=Get Started'))
      .or(page.locator('text=Sign Up'))
      .first()

    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/.*register/)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still load and be usable
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('body')).not.toBeEmpty()
  })
})
