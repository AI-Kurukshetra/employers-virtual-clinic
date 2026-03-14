import { test, expect, Page } from '@playwright/test'
import { narrate, highlight, slowType } from './helpers/narrate'

async function loginAsPatient(page: Page) {
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await page.getByLabel('Email').fill('emma.johnson@gmail.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /^sign in$/i }).click()
    try {
      await expect(page).toHaveURL(/\/patient\/dashboard/, { timeout: 20000 })
      return
    } catch {
      if (attempt === 1) throw new Error('Patient login failed')
    }
  }
}

test('Demo: Patient login and dashboard', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await expect(page.getByLabel('Email')).toBeVisible()
  await narrate(page, 'Logging in as Emma Johnson, a patient with PCOS', 3000)

  await slowType(page, 'input[id="email"]', 'emma.johnson@gmail.com')
  await page.waitForTimeout(500)
  await slowType(page, 'input[id="password"]', 'password123')
  await page.waitForTimeout(500)

  await highlight(page, 'button[type="submit"]')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(/\/patient\/dashboard/)
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

  await narrate(page,
    'Emma\'s personalized dashboard shows her health overview at a glance',
    4000)
  await page.waitForTimeout(2000)

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await narrate(page, 'Upcoming appointments with her care team', 3000)

  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await narrate(page,
    'Health metrics: mood tracking, energy levels, and cycle predictions',
    3500)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
})

test('Demo: Patient appointments', async ({ page }) => {
  await loginAsPatient(page)

  await page.goto('/patient/appointments', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /appointments/i })).toBeVisible()
  await narrate(page,
    'Emma can view all her appointments and book new ones instantly',
    4000)

  const bookBtn = page.locator('button', { hasText: /book/i }).first()
  const bookExists = await bookBtn.count()
  if (bookExists > 0) {
    await narrate(page,
      'Booking a new appointment — choose specialty, provider, and time',
      3500)
    await bookBtn.click()
    await page.waitForTimeout(2000)
    await narrate(page,
      'Smart provider matching finds the best available specialist',
      3000)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
  }
})

test('Demo: Symptom and cycle tracker', async ({ page }) => {
  await loginAsPatient(page)

  await page.goto('/patient/tracker', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /tracker/i })).toBeVisible()
  await narrate(page,
    'The health tracker lets Emma log symptoms, mood, and cycle data daily',
    4000)

  await page.waitForTimeout(1500)

  const slider = page.locator('input[type="range"]').first()
  const sliderExists = await slider.count()
  if (sliderExists > 0) {
    await highlight(page, 'input[type="range"]')
    await narrate(page,
      'Simple sliders to log mood, energy, and pain levels',
      3000)
    await slider.fill('7')
    await page.waitForTimeout(1000)
  }

  const cycleTab = page.locator('button, [role="tab"]', { hasText: /cycle/i }).first()
  const cycleExists = await cycleTab.count()
  if (cycleExists > 0) {
    await cycleTab.click()
    await page.waitForTimeout(1500)
    await narrate(page,
      'Cycle tracking predicts ovulation windows and next period dates',
      4000)
    await page.waitForTimeout(2000)
  }
})

test('Demo: Secure messaging', async ({ page }) => {
  await loginAsPatient(page)

  await page.goto('/patient/messages', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible()
  await narrate(page,
    'HIPAA-compliant messaging lets Emma communicate directly with her care team',
    4000)

  await page.waitForTimeout(1500)

  const conv = page.locator('[class*="conversation"], [class*="thread"], button').first()
  const convExists = await conv.count()
  if (convExists > 0) {
    await conv.click()
    await page.waitForTimeout(1500)
    await narrate(page,
      'All messages are AES-256 encrypted for complete privacy',
      3500)
  }

  await page.waitForTimeout(2000)
})
