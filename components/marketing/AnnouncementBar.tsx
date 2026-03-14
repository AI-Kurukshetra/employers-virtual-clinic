'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[60] bg-[#1a6b4a] px-4 py-2 text-sm text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <button onClick={() => setVisible(false)} className="text-white/90 hover:text-white" type="button">✕</button>
        <p className="line-clamp-1 flex-1 text-center md:text-left">
          Smarter benefits start with better data: Get Virtual Clinic&apos;s State of Women&apos;s &amp; Family Health Benefits 2026
        </p>
        <a href="#" className="whitespace-nowrap underline decoration-white/70 underline-offset-4 hover:decoration-white">
          Access now →
        </a>
      </div>
    </div>
  )
}
