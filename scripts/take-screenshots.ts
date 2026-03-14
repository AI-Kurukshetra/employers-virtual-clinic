import { chromium, BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000'

const PAGES = [
  {
    name: '01-landing-page',
    url: '/',
    label: 'Landing Page',
    waitFor: 2000,
    scroll: 0,
  },
  {
    name: '02-for-employers',
    url: '/for-employers',
    label: 'For Employers',
    waitFor: 2000,
    scroll: 0,
  },
  {
    name: '03-solutions',
    url: '/solutions',
    label: 'Solutions',
    waitFor: 2000,
    scroll: 0,
  },
  {
    name: '04-login',
    url: '/login',
    label: 'Login Page',
    waitFor: 1500,
    scroll: 0,
  },
  {
    name: '05-register',
    url: '/register',
    label: 'Register Page',
    waitFor: 1500,
    scroll: 0,
  },
  {
    name: '06-patient-dashboard',
    url: '/patient/dashboard',
    label: 'Patient Dashboard',
    waitFor: 3000,
    scroll: 0,
    auth: {
      email: 'emma.johnson@gmail.com',
      password: 'password123'
    }
  },
  {
    name: '07-patient-appointments',
    url: '/patient/appointments',
    label: 'Patient Appointments',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'emma.johnson@gmail.com',
      password: 'password123'
    }
  },
  {
    name: '08-patient-tracker',
    url: '/patient/tracker',
    label: 'Health Tracker',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'emma.johnson@gmail.com',
      password: 'password123'
    }
  },
  {
    name: '09-patient-messages',
    url: '/patient/messages',
    label: 'Secure Messages',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'emma.johnson@gmail.com',
      password: 'password123'
    }
  },
  {
    name: '10-provider-dashboard',
    url: '/provider/dashboard',
    label: 'Provider Dashboard',
    waitFor: 3000,
    scroll: 0,
    auth: {
      email: 'sarah.chen@virtualclinic.com',
      password: 'password123'
    }
  },
  {
    name: '11-provider-patients',
    url: '/provider/patients',
    label: 'Patient List',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'sarah.chen@virtualclinic.com',
      password: 'password123'
    }
  },
  {
    name: '12-provider-prescriptions',
    url: '/provider/prescriptions',
    label: 'Prescriptions',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'sarah.chen@virtualclinic.com',
      password: 'password123'
    }
  },
  {
    name: '13-provider-care-plans',
    url: '/provider/care-plans',
    label: 'Care Plans',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'sarah.chen@virtualclinic.com',
      password: 'password123'
    }
  },
  {
    name: '14-employer-dashboard',
    url: '/employer/dashboard',
    label: 'Employer Analytics',
    waitFor: 3000,
    scroll: 0,
    auth: {
      email: 'rachel.kim@acmecorp.com',
      password: 'password123'
    }
  },
  {
    name: '15-employer-billing',
    url: '/employer/billing',
    label: 'Employer Billing',
    waitFor: 2500,
    scroll: 0,
    auth: {
      email: 'rachel.kim@acmecorp.com',
      password: 'password123'
    }
  },
]

type Auth = { email: string; password: string }
type PageConfig = {
  name: string
  url: string
  label: string
  waitFor: number
  scroll: number
  auth?: Auth
}

async function loginUser(page: any, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForTimeout(1500)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
}

async function uploadToSupabase(filePath: string, fileName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const timestamp = Date.now()
  const storagePath = `screenshots/${timestamp}-${fileName}.png`

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (error) {
    console.error(`Upload error for ${fileName}:`, error.message)
    return ''
  }

  const { data } = supabase.storage
    .from('screenshots')
    .getPublicUrl(storagePath)

  return data.publicUrl
}

async function ensureScreenshotsBucket() {
  const { data } = await supabase.storage.getBucket('screenshots')
  if (data) return

  const { error } = await supabase.storage.createBucket('screenshots', {
    public: true,
  })
  if (error && !error.message.toLowerCase().includes('already exists')) {
    throw error
  }
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  console.log('Starting screenshot capture...\n')
  await ensureScreenshotsBucket()

  const screenshotsDir = path.join(process.cwd(), 'screenshots')
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const results: { label: string; url: string; publicUrl: string }[] = []

  const contexts = new Map<string, BrowserContext>()

  for (const pageConfig of PAGES as PageConfig[]) {
    console.log(`Capturing: ${pageConfig.label}...`)

    try {
      let context: BrowserContext

      if (pageConfig.auth) {
        const key = pageConfig.auth.email
        const existing = contexts.get(key)

        if (existing) {
          context = existing
        } else {
          context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
          const loginPage = await context.newPage()
          await loginUser(loginPage, pageConfig.auth.email, pageConfig.auth.password)
          await loginPage.close()
          contexts.set(key, context)
        }
      } else {
        context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
      }

      const page = await context.newPage()
      await page.goto(`${BASE_URL}${pageConfig.url}`)
      await page.waitForTimeout(pageConfig.waitFor)

      if (pageConfig.scroll > 0) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), pageConfig.scroll)
        await page.waitForTimeout(1000)
      }

      const localPath = path.join(screenshotsDir, `${pageConfig.name}.png`)
      await page.screenshot({
        path: localPath,
        fullPage: false,
      })

      const publicUrl = await uploadToSupabase(localPath, pageConfig.name)

      results.push({
        label: pageConfig.label,
        url: `${BASE_URL}${pageConfig.url}`,
        publicUrl,
      })

      console.log(`✅ ${pageConfig.label}: ${publicUrl}`)
      await page.close()

      if (!pageConfig.auth) {
        await context.close()
      }
    } catch (err: any) {
      console.error(`❌ Failed: ${pageConfig.label} — ${err.message}`)
      results.push({
        label: pageConfig.label,
        url: `${BASE_URL}${pageConfig.url}`,
        publicUrl: 'FAILED',
      })
    }
  }

  for (const context of contexts.values()) {
    await context.close()
  }

  await browser.close()

  console.log('\n\n========================================')
  console.log('SCREENSHOT URLS — Copy these for Product Hunt')
  console.log('========================================\n')

  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.label}`)
    console.log(`   ${r.publicUrl}`)
    console.log('')
  })

  const urlReport = results
    .map((r) => `${r.label}\n${r.publicUrl}`)
    .join('\n\n')

  fs.writeFileSync(path.join(process.cwd(), 'screenshot-urls.txt'), urlReport)

  console.log('URLs also saved to: screenshot-urls.txt')
}

main().catch(console.error)
