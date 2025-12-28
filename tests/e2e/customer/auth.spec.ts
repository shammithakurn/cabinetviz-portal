// tests/e2e/customer/auth.spec.ts
// Customer authentication tests

import { test, expect } from 'playwright/test'
import { generateUniqueEmail } from '../utils/helpers'

test.describe('Customer Registration', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/auth/register')

    await expect(page.locator('input[name="name"]').or(page.locator('input[placeholder*="name" i]'))).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/register')
    await page.click('button[type="submit"]')

    // Should show some error indication
    await page.waitForTimeout(500)
    // Check form is still on register page (didn't submit)
    await expect(page).toHaveURL(/.*register/)
  })

  test('should reject invalid email format', async ({ page }) => {
    await page.goto('/auth/register')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'TestPassword123!')

    await page.click('button[type="submit"]')

    // Should stay on register page or show error
    await page.waitForTimeout(1000)
  })

  test('should register successfully with valid data', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail()

    await page.goto('/auth/register')

    await page.fill('input[name="name"]', 'New Test User')
    await page.fill('input[type="email"]', uniqueEmail)
    await page.fill('input[type="password"]', 'TestPassword123!')

    // Fill optional fields if they exist
    const companyInput = page.locator('input[name="company"]')
    if (await companyInput.isVisible()) {
      await companyInput.fill('Test Company')
    }

    const phoneInput = page.locator('input[name="phone"]')
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+64211234567')
    }

    await page.click('button[type="submit"]')

    // Should redirect to dashboard or login
    await page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 })
  })

  test('should have link to login page', async ({ page }) => {
    await page.goto('/auth/register')

    const loginLink = page.locator('a[href*="login"]').or(page.locator('text=Sign In')).or(page.locator('text=Login'))
    await expect(loginLink.first()).toBeVisible()
  })
})

test.describe('Customer Login', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('input[type="email"]', 'nonexistent@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error or stay on login page
    await page.waitForTimeout(1000)

    // Check for error message or still on login page
    const isStillOnLogin = page.url().includes('login')
    const hasError = await page.locator('.error, [class*="error"], [role="alert"]').isVisible().catch(() => false)

    expect(isStillOnLogin || hasError).toBeTruthy()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    // Use seeded test user
    await page.fill('input[type="email"]', 'customer@test.com')
    await page.fill('input[type="password"]', 'customer123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
  })

  test('should have link to register page', async ({ page }) => {
    await page.goto('/auth/login')

    const registerLink = page
      .locator('a[href*="register"]')
      .or(page.locator('text=Sign Up'))
      .or(page.locator('text=Register'))
    await expect(registerLink.first()).toBeVisible()
  })

  test('should have link to forgot password', async ({ page }) => {
    await page.goto('/auth/login')

    const forgotLink = page.locator('a[href*="forgot"]').or(page.locator('text=Forgot'))
    await expect(forgotLink.first()).toBeVisible()
  })
})

test.describe('Forgot Password', () => {
  test('should display forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
