'use client'

import { FormEvent, useState } from 'react'

type Role = 'EMPLOYER' | 'HEALTH_PLAN' | 'CONSULTANT' | 'INDIVIDUAL' | 'PROVIDER'

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    companySize: '',
    role: 'EMPLOYER' as Role,
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    const res = await fetch('/api/marketing/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        company: form.company,
        company_size: form.companySize,
        role: form.role,
        phone: form.phone,
        message: form.message,
        source_page: '/contact',
      }),
    })

    const data = await res.json()
    setLoading(false)
    setResult(data?.message || 'Submitted')

    if (res.ok) {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        companySize: '',
        role: 'EMPLOYER',
        phone: '',
        message: '',
      })
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-2">
      <section>
        <h2 className="text-4xl font-bold text-gray-900">Let&apos;s deliver exceptional healthcare together</h2>
        <p className="mt-4 text-gray-600">Tell us about your organization and we&apos;ll be in touch.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="First name" className="rounded-lg border border-gray-300 px-4 py-3" required />
            <input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Last name" className="rounded-lg border border-gray-300 px-4 py-3" required />
          </div>
          <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Work email" className="w-full rounded-lg border border-gray-300 px-4 py-3" required />
          <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Company name" className="w-full rounded-lg border border-gray-300 px-4 py-3" required />
          <select value={form.companySize} onChange={(e) => setForm((p) => ({ ...p, companySize: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-4 py-3" required>
            <option value="">Company size</option>
            <option value="1-100">1-100</option>
            <option value="101-500">101-500</option>
            <option value="501-1000">501-1000</option>
            <option value="1000-5000">1000-5000</option>
            <option value="5000+">5000+</option>
          </select>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">I am a:</p>
            <div className="flex flex-wrap gap-4">
              {(['EMPLOYER', 'HEALTH_PLAN', 'CONSULTANT', 'INDIVIDUAL', 'PROVIDER'] as Role[]).map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="role" value={role} checked={form.role === role} onChange={() => setForm((p) => ({ ...p, role }))} />
                  {role.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number" className="w-full rounded-lg border border-gray-300 px-4 py-3" />
          <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Message" className="min-h-32 w-full rounded-lg border border-gray-300 px-4 py-3" />

          <button type="submit" disabled={loading} className="rounded-full bg-[#1a6b4a] px-8 py-3 font-medium text-white disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit'}
          </button>

          {result && <p className="text-sm text-[#1a6b4a]">{result}</p>}
        </form>
      </section>

      <aside className="rounded-2xl bg-[#f5f9f7] p-8">
        <h3 className="text-2xl font-bold text-gray-900">Why Virtual Clinic?</h3>
        <ul className="mt-5 space-y-3 text-gray-700">
          <li>Comprehensive women&apos;s and family healthcare across life stages</li>
          <li>Global provider network with personalized, inclusive support</li>
          <li>Validated outcomes that improve health and business results</li>
        </ul>
        <div className="mt-10 space-y-2 text-sm text-gray-600">
          <p>Sales: hello@virtualclinic.com</p>
          <p>Support: support@virtualclinic.com</p>
          <p>Phone: +1 (800) 555-0199</p>
        </div>
      </aside>
    </main>
  )
}
