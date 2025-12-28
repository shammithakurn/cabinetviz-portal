// tests/e2e/utils/helpers.ts
// Helper functions for E2E tests

import { Page } from 'playwright/test'

export const testCustomer = {
  name: 'John Smith',
  email: 'customer@test.com',
  password: 'customer123',
  company: 'Smith Joinery',
  phone: '+64 21 123 4567',
}

export const testAdmin = {
  name: 'Admin User',
  email: 'admin@cabinetviz.com',
  password: 'admin123',
  role: 'ADMIN',
}

export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', testCustomer.email)
  await page.fill('input[type="password"]', testCustomer.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', testAdmin.email)
  await page.fill('input[type="password"]', testAdmin.password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/admin', { timeout: 10000 })
}

export async function logout(page: Page): Promise<void> {
  // Look for logout button/link
  const logoutButton = page.locator('text=Logout').or(page.locator('text=Sign Out'))
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  }
}

export function generateUniqueEmail(): string {
  return `test${Date.now()}@example.com`
}
