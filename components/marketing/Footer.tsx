import Link from 'next/link'

const cols = [
  {
    title: 'Join Virtual Clinic',
    links: ['Employers', 'Health Plans', 'Consultants', 'Individuals', 'Become a Provider'],
  },
  {
    title: 'Programs',
    links: ['Fertility & Family Building', 'Maternity & Newborn Care', 'Virtual Milk', 'Parenting & Pediatrics', 'Menopause & Midlife Health', 'Virtual Wallet', 'Virtual Managed Benefit'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Solutions', 'Pricing', 'Book a demo'],
  },
  {
    title: 'Resources',
    links: ['Member Journey', 'Resource Center', 'Clinical Research Institute', 'Webinars', 'Blog', 'Case Studies'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0d1f15] px-8 py-16 text-white">
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-white/90">{col.title}</h4>
              <ul className="space-y-2 text-sm text-white/75">
                {col.links.map((link) => (
                  <li key={link} className="hover:text-white">
                    <a href="#" className="inline-flex items-center gap-2">
                      {link}
                      {link === 'Careers' ? <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px]">HIRING</span> : null}
                      {link === 'Member Journey' ? <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px]">NEW</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a913bf9791c858337e9_370b6087dba16f5141047c96780e745c_App%20Store%20Icon.webp" alt="App Store" className="h-11 w-auto" />
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a913bf9791c858337e6_bba7d3032aa106133f38f60ee9303719_Google%20Play%20Icon.webp" alt="Google Play" className="h-11 w-auto" />
          </div>
          <div className="flex items-center gap-4 text-sm text-white/75">
            <a href="#">LinkedIn</a>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/70 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <p>© 2026 Virtual Clinic Co. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a913bf9791c858337e5_638bca78abe25bb49c4fc34cc7019ad3_stars.webp" alt="Stars" className="h-4 w-auto" />
              <span>Based on 3,695 reviews</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Security</Link>
            <Link href="#">Cookie Declaration</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
