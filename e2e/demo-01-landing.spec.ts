import { test, expect } from '@playwright/test'
import { narrate, highlight } from './helpers/narrate'

test('Demo: Landing page tour', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('a[href="/login"]').first()).toBeVisible()

  await narrate(page,
    'Welcome to Virtual Clinic — the comprehensive women\'s and family health platform',
    4000)

  await narrate(page,
    'Our platform serves patients, healthcare providers, and employers',
    3000)

  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }))
  await page.waitForTimeout(2000)

  await narrate(page,
    'Patients get 24/7 access to OB/GYNs, fertility specialists, and mental health providers',
    4000)

  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }))
  await page.waitForTimeout(2000)

  await narrate(page,
    'Employers can offer comprehensive women\'s health as an employee benefit',
    3500)

  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: 'smooth' }))
  await page.waitForTimeout(2000)

  await narrate(page,
    'Proven results: up to 27% lower NICU admissions and 30% pregnancy success without ART',
    4000)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)

  await narrate(page, 'Let\'s sign in and explore the platform', 2500)
  await highlight(page, 'a[href="/login"]')
  await page.waitForTimeout(1000)
})
