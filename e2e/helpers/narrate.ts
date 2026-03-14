import { Page } from "@playwright/test";

export async function narrate(page: Page, text: string, duration = 3000) {
  try {
    await page.evaluate((msg) => {
      const existing = document.getElementById("narrator-box");
      if (existing) existing.remove();
      const box = document.createElement("div");
      box.id = "narrator-box";
      box.innerText = msg;
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
      `;
      document.body.appendChild(box);
    }, text);
  } catch {
    // page may have navigated — ignore
  }

  // Split duration into small chunks to avoid timeout
  const chunks = Math.floor(duration / 500);
  for (let i = 0; i < chunks; i++) {
    try {
      await page.waitForTimeout(500);
    } catch {
      break;
    }
  }

  try {
    await page.evaluate(() => {
      const box = document.getElementById("narrator-box");
      if (box) box.remove();
    });
  } catch {
    // page may have navigated — ignore
  }
}

export async function highlight(page: Page, selector: string) {
  try {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (!el) return;
      const prev = el.style.cssText;
      el.style.cssText += `
        outline: 3px solid #22c55e !important;
        outline-offset: 4px !important;
      `;
      setTimeout(() => {
        el.style.cssText = prev;
      }, 2000);
    }, selector);
  } catch {
    // ignore
  }
}

export async function slowType(page: Page, selector: string, text: string) {
  try {
    await page.click(selector);
    await page.fill(selector, "");
    for (const char of text) {
      await page.type(selector, char, { delay: 50 });
    }
  } catch {
    // ignore
  }
}
