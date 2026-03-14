import { expect, test, Page } from '@playwright/test'
import { narrate, highlight } from './helpers/narrate'

async function loginAsProvider(page: Page) {
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await page.getByLabel('Email').fill('sarah.chen@virtualclinic.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /^sign in$/i }).click()
    try {
      await expect(page).toHaveURL(/\/provider\/dashboard/, { timeout: 20000 })
      return
    } catch {
      if (attempt === 1) throw new Error('Provider login failed')
    }
  }
}

test('Demo: Provider dashboard', async ({ page }) => {
  await loginAsProvider(page)
  await expect(page.getByRole('heading', { name: /provider dashboard/i })).toBeVisible()

  await narrate(page,
    'Dr. Sarah Chen\'s provider dashboard — managing her OB/GYN practice',
    4000)
  await page.waitForTimeout(2000)

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }))
  await page.waitForTimeout(1500)
  await narrate(page,
    'Today\'s schedule with patient queue and appointment details',
    3500)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
})

test('Demo: Patient chart review', async ({ page }) => {
  await loginAsProvider(page)

  await page.goto('/provider/patients', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /patients/i })).toBeVisible()
  await narrate(page,
    'Complete patient list with search and filtering capabilities',
    3500)

  const patient = page.locator('[class*="card"], tr, [class*="patient"]').first()
  const patientExists = await patient.count()
  if (patientExists > 0) {
    await patient.click()
    await page.waitForTimeout(2000)
    await narrate(page,
      'Comprehensive patient chart: symptoms, cycles, labs, prescriptions — all in one place',
      4500)

    const tabs = page.locator('[role="tab"]')
    const tabCount = await tabs.count()
    for (let i = 1; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(1500)
      await narrate(page, `Viewing patient ${['symptoms', 'prescriptions', 'lab results', 'care plans'][i - 1]}`, 2500)
    }
  }
})

test('Demo: Write prescription', async ({ page }) => {
  await loginAsProvider(page)

  await page.goto('/provider/prescriptions', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /prescription management/i })).toBeVisible()
  await narrate(page,
    'Electronic prescribing with pharmacy integration and refill management',
    4000)

  const newBtn = page.locator('button', { hasText: /new prescription/i }).first()
  const btnExists = await newBtn.count()
  if (btnExists > 0) {
    await newBtn.click()
    await page.waitForTimeout(1500)
    await narrate(page,
      'Providers can write prescriptions directly from the platform',
      3500)
    await page.keyboard.press('Escape')
  }
})
