import { expect, test, Page } from '@playwright/test'
import { narrate } from './helpers/narrate'

async function loginAsEmployer(page: Page) {
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await page.getByLabel('Email').fill('rachel.kim@acmecorp.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /^sign in$/i }).click()
    try {
      await expect(page).toHaveURL(/\/employer\/dashboard/, { timeout: 20000 })
      return
    } catch {
      if (attempt === 1) throw new Error('Employer login failed')
    }
  }
}

test('Demo: Employer analytics', async ({ page }) => {
  await loginAsEmployer(page)
  await expect(page.getByRole('heading', { name: /employer dashboard/i })).toBeVisible()

  await narrate(page,
    'Acme Corp\'s employer dashboard — real-time workforce health analytics',
    4000)
  await page.waitForTimeout(2000)

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await narrate(page,
    '6 key metrics: enrollment, appointments, satisfaction, and estimated cost savings',
    4000)

  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await narrate(page,
    'Visual analytics: appointment trends, specialty breakdown, and engagement rates',
    4000)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
})

test('Demo: Employer billing', async ({ page }) => {
  await loginAsEmployer(page)

  await page.goto('/employer/billing', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible()
  await narrate(page,
    'Transparent billing: per-employee pricing with full invoice history',
    4000)
  await page.waitForTimeout(3000)
})
