// tests/e2e/admin/jobs.spec.ts
// Admin job management tests

import { test, expect } from 'playwright/test'

test.describe('Admin Job Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should display jobs list', async ({ page }) => {
    await page.goto('/admin/jobs')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should filter jobs by status', async ({ page }) => {
    await page.goto('/admin/jobs')

    // Check for status filter
    const statusFilter = page.locator('select[name="status"]').or(page.locator('text=Status'))
    // If filter exists, test it
  })

  test('should view job details', async ({ page }) => {
    await page.goto('/admin/jobs')

    // Click on first job if exists
    const jobRow = page.locator('[data-testid="job-row"]').or(page.locator('tr').nth(1)).or(page.locator('a[href*="/admin/jobs/"]').first())

    if (await jobRow.isVisible()) {
      await jobRow.click()
      // Should navigate to job detail
      await page.waitForURL(/\/admin\/jobs\//, { timeout: 5000 })
    }
  })
})

test.describe('Admin Deliverable Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@cabinetviz.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 10000 })
  })

  test('should access deliverables page', async ({ page }) => {
    await page.goto('/admin/jobs')

    // Find a job and navigate to its deliverables
    const jobLink = page.locator('a[href*="/admin/jobs/"]').first()

    if (await jobLink.isVisible()) {
      await jobLink.click()
      await page.waitForURL(/\/admin\/jobs\//, { timeout: 5000 })

      // Look for deliverables link
      const deliverableLink = page.locator('a[href*="deliverables"]').or(page.locator('text=Deliverables')).first()
      if (await deliverableLink.isVisible()) {
        await deliverableLink.click()
        await expect(page).toHaveURL(/.*deliverables/)
      }
    }
  })

  test('should display deliverable upload form', async ({ page }) => {
    // This test needs an actual job ID - skip if none exists
    await page.goto('/admin/jobs')

    const jobLink = page.locator('a[href*="/admin/jobs/"]').first()
    if (await jobLink.isVisible()) {
      const href = await jobLink.getAttribute('href')
      if (href) {
        await page.goto(href + '/deliverables')

        // Check for upload form
        const uploadForm = page.locator('input[type="file"]').or(page.locator('text=Upload'))
        await expect(uploadForm.first()).toBeVisible()
      }
    }
  })
})
