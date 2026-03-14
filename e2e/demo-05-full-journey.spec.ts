import { test, expect } from '@playwright/test'
import { narrate } from './helpers/narrate'

test('Full demo journey', async ({ page }) => {
  test.setTimeout(180000)

  const loginAs = async (
    email: string,
    password: string,
    expectedPath: RegExp,
    expectedHeading: RegExp
  ) => {
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto('/login', { waitUntil: 'networkidle' })
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
      await page.getByLabel('Email').fill(email)
      await page.getByLabel('Password').fill(password)
      await page.getByRole('button', { name: /^sign in$/i }).click()
      try {
        await expect(page).toHaveURL(expectedPath, { timeout: 20000 })
        await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible()
        return
      } catch {
        if (attempt === 1) throw new Error(`Login failed for ${email}`)
      }
    }
  }

  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  await narrate(page,
    'Virtual Clinic — Built with Next.js, Supabase, and Vercel',
    3500)

  await page.goto('/for-employers')
  await expect(page).toHaveURL(/\/for-employers$/)
  await expect(page.getByRole('banner').getByRole('link', { name: /book a demo/i })).toBeVisible()
  await narrate(page,
    'Comprehensive women\'s health benefits platform for modern employers',
    4000)
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }))
  await page.waitForTimeout(2000)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)

  await page.goto('/login', { waitUntil: 'networkidle' })
  await expect(page.getByLabel('Email')).toBeVisible()
  await narrate(page, 'Patient experience — secure login', 2500)
  await page.getByLabel('Email').fill('emma.johnson@gmail.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

  await narrate(page,
    'Personalized patient dashboard with health insights',
    3500)

  await page.goto('/patient/tracker', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/patient\/tracker/)
  await expect(page.getByRole('heading', { name: /tracker/i })).toBeVisible()
  await narrate(page, 'Symptom and cycle tracking', 3000)

  await page.goto('/patient/messages', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/patient\/messages/)
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible()
  await narrate(page, 'Encrypted messaging with care team', 3000)

  await loginAs(
    'sarah.chen@virtualclinic.com',
    'password123',
    /\/provider\/dashboard/,
    /provider dashboard/i
  )

  await narrate(page,
    'Provider dashboard — Dr. Sarah Chen\'s clinical workspace',
    3500)

  await page.goto('/provider/patients', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/provider\/patients/)
  await expect(page.getByRole('heading', { name: /patients/i })).toBeVisible()
  await narrate(page, 'Patient management and clinical records', 3000)

  await loginAs(
    'rachel.kim@acmecorp.com',
    'password123',
    /\/employer\/dashboard/,
    /employer dashboard/i
  )

  await narrate(page,
    'Employer analytics — real-time workforce health data',
    3500)

  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  await narrate(page,
    'Build fast. Scale smart. Stay secure. Powered by Bacancy.',
    4000)
})
