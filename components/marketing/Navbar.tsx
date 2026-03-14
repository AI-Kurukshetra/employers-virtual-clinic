'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Star } from 'lucide-react'

type MenuKey = 'why' | 'programs' | 'for' | 'resources' | null

export default function Navbar() {
  const [active, setActive] = useState<MenuKey>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const keepOpen = (key: MenuKey) => ({
    onMouseEnter: () => setActive(key),
    onMouseLeave: () => setActive(null),
  })

  const toggleMenu = (key: Exclude<MenuKey, null>) => {
    setActive((prev) => (prev === key ? null : key))
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-[#1a6b4a]">Virtual Clinic</Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-700 lg:flex">
          <div className="relative" {...keepOpen('why')}>
            <button type="button" onClick={() => toggleMenu('why')} className="hover:text-[#1a6b4a]">Why Us</button>
            {active === 'why' ? (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-[280px] rounded-xl bg-white p-4 shadow-lg">
                  <div className="space-y-2 text-sm">
                    <Link href="/about" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">About Us</Link>
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Solutions</Link>
                    <Link href="/case-studies" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Case Studies</Link>
                    <Link href="/member-journey" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Maven Member Journey</Link>
                    <Link href="/clinical-research-institute" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Clinical Research Institute</Link>
                    <Link href="/maven-roi" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Maven ROI</Link>
                    <Link href="/pricing" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Pricing</Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" {...keepOpen('programs')}>
            <button type="button" onClick={() => toggleMenu('programs')} className="hover:text-[#1a6b4a]">Programs</button>
            {active === 'programs' ? (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-[380px] rounded-xl bg-white p-4 shadow-lg">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">PROGRAMS</p>
                  <div className="space-y-1">
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Fertility &amp; Family Building</Link>
                    <Link href="/solutions" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">Maven Managed Benefit <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-[#1a6b4a]"><Star className="h-3 w-3" />New</span></Link>
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Maternity &amp; Newborn Care</Link>
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Parenting &amp; Pediatrics</Link>
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Menopause &amp; Midlife Health</Link>
                  </div>
                  <p className="mb-2 mt-4 text-xs font-semibold tracking-wide text-slate-500">PROGRAM EXTENSIONS</p>
                  <div className="space-y-1">
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Maven Wallet</Link>
                    <Link href="/solutions" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Maven Milk</Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" {...keepOpen('for')}>
            <button type="button" onClick={() => toggleMenu('for')} className="hover:text-[#1a6b4a]">For</button>
            {active === 'for' ? (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-[220px] rounded-xl bg-white p-4 shadow-lg">
                  <div className="space-y-1">
                    <Link href="/for-employers" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Employers</Link>
                    <Link href="/for-health-plans" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Health Plans</Link>
                    <Link href="/for-consultants" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Consultants</Link>
                    <Link href="/for-individuals" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Individuals</Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" {...keepOpen('resources')}>
            <button type="button" onClick={() => toggleMenu('resources')} className="hover:text-[#1a6b4a]">Resources</button>
            {active === 'resources' ? (
              <div className="absolute right-0 top-full pt-2">
                <div className="grid w-[460px] grid-cols-[1fr_180px] gap-4 rounded-xl bg-white p-4 shadow-lg">
                  <div className="space-y-1">
                    <Link href="/blog" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Blog</Link>
                    <Link href="/resource-center" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Resource Center</Link>
                    <Link href="/webinars" className="block rounded-md px-2 py-1.5 hover:bg-slate-50">Webinars</Link>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-100">
                    <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749d643b9c945ff21b80b_e4ddf335638a14cea26a1273f0c318a8_card1.webp" alt="Featured resource" className="h-24 w-full object-cover" />
                    <p className="p-2 text-xs text-slate-600">Featured resource</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">Login</Link>
          <Link href="/contact" className="rounded-full bg-[#1a6b4a] px-5 py-2 text-sm text-white">Book a demo</Link>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} type="button" aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mt-4 border-t border-gray-100 pt-4 lg:hidden">
          <div className="space-y-2 text-sm">
            <Link href="/solutions" className="block rounded-md px-2 py-2 hover:bg-slate-50">Why Us</Link>
            <Link href="/solutions" className="block rounded-md px-2 py-2 hover:bg-slate-50">Programs</Link>
            <Link href="/for-employers" className="block rounded-md px-2 py-2 hover:bg-slate-50">For Employers</Link>
            <Link href="/for-health-plans" className="block rounded-md px-2 py-2 hover:bg-slate-50">For Health Plans</Link>
            <Link href="/for-consultants" className="block rounded-md px-2 py-2 hover:bg-slate-50">For Consultants</Link>
            <Link href="/for-individuals" className="block rounded-md px-2 py-2 hover:bg-slate-50">For Individuals</Link>
            <Link href="/resource-center" className="block rounded-md px-2 py-2 hover:bg-slate-50">Resources</Link>
            <Link href="/login" className="block rounded-md px-2 py-2 hover:bg-slate-50">Login</Link>
            <Link href="/contact" className="mt-2 block rounded-full bg-[#1a6b4a] px-4 py-2 text-center text-white">Book a demo</Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
