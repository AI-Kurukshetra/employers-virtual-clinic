import { test } from "@playwright/test";
import { narrate, highlight, slowType } from "./helpers/narrate";

test("Complete Virtual Clinic Demo", async ({ page }) => {
  // ── PART 1: LANDING PAGE ──────────────────────────
  await page.goto("/");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Welcome to Virtual Clinic — comprehensive women's and family health platform",
    4000,
  );
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Built for patients, providers, and employers — all in one platform",
    3500,
  );
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Proven outcomes: 27% lower NICU admissions, 30% natural pregnancy success",
    4000,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1000);

  // ── PART 2: FOR EMPLOYERS PAGE ────────────────────
  await page.goto("/for-employers");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Employers get a full analytics dashboard and benefits management platform",
    4000,
  );
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "2000+ leading companies trust Virtual Clinic for their workforce health",
    3500,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1000);

  // ── PART 3: PATIENT LOGIN ─────────────────────────
  await page.goto("/login");
  await page.waitForTimeout(1500);
  await narrate(
    page,
    "Secure patient login — let's sign in as Emma Johnson, a PCOS patient",
    3500,
  );
  await page.fill('input[type="email"]', "emma.johnson@gmail.com");
  await page.waitForTimeout(500);
  await page.fill('input[type="password"]', "password123");
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(11000);

  // ── PART 4: PATIENT DASHBOARD ─────────────────────
  await narrate(
    page,
    "Emma's personalized dashboard — health overview at a glance",
    12000,
  );
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(4000);
  await narrate(
    page,
    "Upcoming appointments, health metrics, and prescription refill reminders",
    4000,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1000);

  // ── PART 5: APPOINTMENTS ──────────────────────────
  await page.goto("/patient/appointments");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Book appointments with specialists — OB/GYN, fertility, mental health, and more",
    3000,
  );
  await page.waitForTimeout(1000);

  // Remove narrator box BEFORE navigating to new page
  try {
    await page.evaluate(() => {
      const box = document.getElementById("narrator-box");
      if (box) box.remove();
    });
  } catch {
    // ignore if already gone
  }

  // ── PART 6: HEALTH TRACKER ────────────────────────
  await page.goto("/patient/tracker");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(3000);
  await narrate(
    page,
    "Daily health tracking — symptoms, mood, energy levels, and cycle data",
    4000,
  );
  await page.waitForTimeout(1500);
  const slider = page.locator('input[type="range"]').first();
  const sliderExists = await slider.count();
  if (sliderExists > 0) {
    await slider.fill("7");
    await page.waitForTimeout(500);
    await narrate(
      page,
      "Simple sliders to log mood 7/10, energy, and pain levels daily",
      3500,
    );
  }
  const cycleTab = page
    .locator('button, [role="tab"]', { hasText: /cycle/i })
    .first();
  if ((await cycleTab.count()) > 0) {
    await cycleTab.click();
    await page.waitForTimeout(1500);
    await narrate(
      page,
      "Cycle tracking predicts ovulation windows and next period with AI insights",
      4000,
    );
    await page.waitForTimeout(2000);
  }

  // ── PART 7: MESSAGES ──────────────────────────────
  await page.goto("/patient/messages");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "HIPAA-compliant encrypted messaging with the entire care team",
    4000,
  );
  await page.waitForTimeout(2000);

  // ── PART 8: PROVIDER LOGIN ────────────────────────
  await page.goto("/login");
  await page.waitForTimeout(1000);
  await narrate(
    page,
    "Now switching to Dr. Sarah Chen — OB/GYN provider view",
    3000,
  );
  await page.fill('input[type="email"]', "sarah.chen@virtualclinic.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // ── PART 9: PROVIDER DASHBOARD ───────────────────
  await narrate(
    page,
    "Provider dashboard — today's schedule, patient queue, and clinical tools",
    4000,
  );
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await narrate(
    page,
    "Real-time patient queue with one-click consultation start",
    3500,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1000);

  // ── PART 10: PATIENT CHART ────────────────────────
  await page.goto("/provider/patients");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Full patient list with search — click any patient for their complete chart",
    4000,
  );
  const patient = page
    .locator('[class*="card"], tr, [class*="patient"]')
    .first();
  if ((await patient.count()) > 0) {
    await patient.click();
    await page.waitForTimeout(2000);
    await narrate(
      page,
      "Complete patient chart — symptoms, cycles, labs, prescriptions, care plans",
      4500,
    );
    await page.waitForTimeout(2000);
  }

  // ── PART 11: PRESCRIPTIONS ────────────────────────
  await page.goto("/provider/prescriptions");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Electronic prescribing with pharmacy integration and refill tracking",
    4000,
  );
  await page.waitForTimeout(2000);

  // ── PART 12: EMPLOYER LOGIN ───────────────────────
  await page.goto("/login");
  await page.waitForTimeout(1000);
  await narrate(
    page,
    "Finally — the employer view. Logging in as Rachel Kim, HR at Acme Corp",
    3500,
  );
  await page.fill('input[type="email"]', "rachel.kim@acmecorp.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // ── PART 13: EMPLOYER DASHBOARD ──────────────────
  await narrate(
    page,
    "Employer analytics — real-time workforce health data and ROI metrics",
    4000,
  );
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await narrate(
    page,
    "Visual charts: appointment trends, specialty breakdown, cost savings",
    4000,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1000);

  // ── PART 14: BILLING ──────────────────────────────
  await page.goto("/employer/billing");
  await page.waitForTimeout(2000);
  await narrate(
    page,
    "Transparent billing — per-employee pricing, invoice history, plan management",
    4000,
  );
  await page.waitForTimeout(2000);

  // ── PART 15: CLOSING ──────────────────────────────
  await page.goto("/");
  await page.waitForTimeout(1500);
  await narrate(
    page,
    "Virtual Clinic — Next.js · Supabase · Vercel · Built in 10 hours",
    3500,
  );
  await page.waitForTimeout(1000);
  await narrate(
    page,
    "Build fast. Scale smart. Stay secure. Powered by Bacancy.",
    4000,
  );
  await page.waitForTimeout(2000);
});
