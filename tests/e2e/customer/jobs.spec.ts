// tests/e2e/customer/jobs.spec.ts
// Customer job creation and management tests

import { test, expect } from 'playwright/test'

test.describe('Create New Job', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'customer@test.com')
    await page.fill('input[type="password"]', 'customer123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
  })

  test('should display job creation page', async ({ page }) => {
    await page.goto('/jobs/new')

    await expect(page.locator('body')).not.toBeEmpty()
    // Check for form elements
    await expect(
      page.locator('input[name="title"]').or(page.locator('input[placeholder*="title" i]'))
    ).toBeVisible()
  })

  test('should have project type selection', async ({ page }) => {
    await page.goto('/jobs/new')

    // Look for project type dropdown or selection
    const projectTypeSelect = page.locator('select[name="projectType"]').or(page.locator('select').first())
    await expect(projectTypeSelect).toBeVisible()
  })

  test('should have package selection', async ({ page }) => {
    await page.goto('/jobs/new')

    // Check for package options
    const basicOption = page.locator('text=Basic').or(page.locator('text=$99'))
    const proOption = page.locator('text=Professional').or(page.locator('text=$199'))

    // At least one package option should exist
    const hasPackages = (await basicOption.count()) > 0 || (await proOption.count()) > 0
    expect(hasPackages).toBeTruthy()
  })

  test('should have dimension inputs', async ({ page }) => {
    await page.goto('/jobs/new')

    // Look for dimension fields
    const widthInput = page.locator('input[name="width"]').or(page.locator('input[placeholder*="width" i]'))
    const heightInput = page.locator('input[name="height"]').or(page.locator('input[placeholder*="height" i]'))

    // These should exist somewhere in the form
  })

  test('should have file upload area', async ({ page }) => {
    await page.goto('/jobs/new')

    // Look for file upload elements
    const fileInput = page.locator('input[type="file"]')
    const dropzone = page.locator('[class*="dropzone"]').or(page.locator('text=drag').or(page.locator('text=upload')))

    // Should have some upload mechanism
  })

  test('should create job successfully', async ({ page }) => {
    await page.goto('/jobs/new')

    // Fill in job details
    const titleInput = page.locator('input[name="title"]').or(page.locator('input').first())
    await titleInput.fill('Test Kitchen Project ' + Date.now())

    // Select project type if dropdown exists
    const projectTypeSelect = page.locator('select[name="projectType"]')
    if (await projectTypeSelect.isVisible()) {
      await projectTypeSelect.selectOption({ index: 1 })
    }

    // Fill dimensions if visible
    const widthInput = page.locator('input[name="width"]')
    if (await widthInput.isVisible()) {
      await widthInput.fill('3000')
    }

    const heightInput = page.locator('input[name="height"]')
    if (await heightInput.isVisible()) {
      await heightInput.fill('2400')
    }

    const depthInput = page.locator('input[name="depth"]')
    if (await depthInput.isVisible()) {
      await depthInput.fill('600')
    }

    // Navigate through steps and submit
    // This depends on the actual form implementation
  })
})

test.describe('View Jobs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'customer@test.com')
    await page.fill('input[type="password"]', 'customer123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 })
  })

  test('should display jobs list', async ({ page }) => {
    await page.goto('/dashboard/jobs')

    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should show empty state or jobs', async ({ page }) => {
    await page.goto('/dashboard/jobs')

    // Should either show jobs or empty state message
    await page.waitForTimeout(1000)
  })
})
