import { Page } from '@playwright/test'

export async function narrate(page: Page, text: string, duration = 3000) {
  await page.evaluate((msg) => {
    const existing = document.getElementById('narrator-box')
    if (existing) existing.remove()
    const box = document.createElement('div')
    box.id = 'narrator-box'
    box.innerText = msg
    box.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.82);
      color: white;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 18px;
      font-family: system-ui;
      z-index: 99999;
      max-width: 700px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
      animation: fadeIn 0.3s ease;
    `
    document.body.appendChild(box)
  }, text)
  await page.waitForTimeout(duration)
  await page.evaluate(() => {
    const box = document.getElementById('narrator-box')
    if (box) box.remove()
  })
}

export async function highlight(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return
    const prev = (el as HTMLElement).style.cssText
    ;(el as HTMLElement).style.cssText += `
      outline: 3px solid #22c55e !important;
      outline-offset: 4px !important;
      transition: outline 0.2s;
    `
    setTimeout(() => {
      (el as HTMLElement).style.cssText = prev
    }, 2000)
  }, selector)
}

export async function slowType(
  page: Page,
  selector: string,
  text: string
) {
  await page.click(selector)
  await page.fill(selector, '')
  for (const char of text) {
    await page.type(selector, char, { delay: 60 })
  }
}
