'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const programSlides = [
  {
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62ea896b7722a5c029e64585_Maven-solutions_feritylyandfamilybuilding.webp',
    title: 'Fertility & Family Building',
    body: 'Support across fertility, family planning, and treatment navigation with expert care and transparent guidance.',
  },
  {
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62ea89ea9bacb859e6c179b8_Maven-solutions_maternityandnewborncare.webp',
    title: 'Maternity & Newborn Care',
    body: 'Continuous support from pregnancy through postpartum and return-to-work, with coordinated virtual care teams.',
  },
  {
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62e197598657fdaba60679bc_family_quote_photo.webp',
    title: 'Parenting & Pediatrics',
    body: 'On-demand pediatric and parenting support that helps families manage daily challenges and long-term development.',
  },
  {
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62ea8c0867dbd22f0613940c_Maven-solutions-menopause.webp',
    title: 'Menopause & Midlife Health',
    body: 'Evidence-based menopause and midlife support for physical, emotional, and professional wellbeing.',
  },
]

const featureTabs = [
  {
    title: '24/7 Access',
    text: 'Members can book same-day appointments with providers across 30+ specialties and Care Advocates—available around the world and around the clock',
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62eaa574b9d8d18d6577e44e_Maven-solutions_personilized-care-photo.webp',
  },
  {
    title: 'Personalized Care Plans',
    text: 'Tailored guidance for members, including action plans and interventions, that drive better outcomes',
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62eaa6103f3e8932f60e8952_Maven-solutions_on-demand-support_photo.webp',
  },
  {
    title: 'Inclusive Care',
    text: 'Programs and providers attuned to the unique needs and preferences of each individual',
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62eab258baef827be26004ae_Maven-solutions_inclusive-care_photo.webp',
  },
  {
    title: 'Emotional & Mental Well-being',
    text: "Proactive, ongoing mental health support throughout every member's health journey",
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62eaa7328192a82af18485e7_Maven-solutions_emotional-support_photo.webp',
  },
  {
    title: 'Financial Support',
    text: 'A flexible, easy-to-use solution that enables employers to extend financial support for fertility treatment, adoption, surrogacy, or doula care',
    image:
      'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62eab2338ca536078bcc7f07_Maven-solutions_financial-support_photo2.webp',
  },
]

const testimonials = [
  {
    quote:
      "Our employees are so very appreciative of this program. I've had people call me and say, I couldn't have come back to work without the support through Maven and SoFi.",
    author: 'Debbie Westover, Senior Benefits Manager at SoFi',
  },
  {
    quote:
      "Maven has offered so many resources to both mothers and fathers—before they go out on leave, while they're out, and when they come back.",
    author: 'Todd McCafferty, Benefits Manager at White & Case LLP',
  },
  {
    quote:
      "You can be a same-sex couple; you can do surrogacy or adoption; your husband can use it—it's very inclusive and it's also global.",
    author: 'Lucy Avsharyan, Global Benefits Manager at United Talent Agency',
  },
]

const roles = ['Employer', 'Health Plan', 'Consultant', 'Individual', 'Provider']

export default function SolutionsPage() {
  const [slide, setSlide] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [testimonial, setTestimonial] = useState(0)
  const [selectedRole, setSelectedRole] = useState('Employer')

  useEffect(() => {
    const id = setInterval(() => setSlide((p) => (p + 1) % programSlides.length), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTestimonial((p) => (p + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="bg-white text-gray-900">
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <h1 className="text-5xl font-bold leading-tight">Better care designed to meet your needs</h1>
          <p className="mt-5 text-xl text-gray-600">A flexible women&apos;s and family health solution, delivering in-depth care from family planning through midlife</p>
          <Link href="/contact" className="mt-8 inline-block rounded-full bg-[#1a6b4a] px-8 py-3 font-medium text-white">
            Book a demo
          </Link>
        </div>
        <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/62ea8502156de8eca1b6f1de_Maven-solutions_hero_family.webp" alt="Solutions hero" className="w-full rounded-2xl" />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Bridge care gaps</h3>
            <p className="mt-3 text-gray-600">Our inclusive, comprehensive benefits are designed to address health disparities, drive trust, and create great member experiences.</p>
          </article>
          <article className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Improve member health</h3>
            <p className="mt-3 text-gray-600">Members receive personalized, timely support from family planning through midlife—avoiding costly treatments.</p>
          </article>
          <article className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Build thriving organizations</h3>
            <p className="mt-3 text-gray-600">Transform workplace wellness with global employee benefits that attract and retain talent.</p>
          </article>
        </div>
      </section>

      <section className="bg-[#f5f9f7] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
          <div>
            <p className="text-5xl font-bold text-[#1a6b4a]">30%</p>
            <p className="mt-3 text-sm text-gray-600">of members struggling to conceive achieve pregnancy without ART</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-[#1a6b4a]">33%</p>
            <p className="mt-3 text-sm text-gray-600">of members report they can better manage anxiety or depression</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-[#1a6b4a]">3x</p>
            <p className="mt-3 text-sm text-gray-600">Members are 3x more likely to manage their health during menopause</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <img src={programSlides[slide].image} alt={programSlides[slide].title} className="h-full w-full rounded-xl object-cover" />
            <div>
              <h2 className="text-3xl font-bold">{programSlides[slide].title}</h2>
              <p className="mt-4 text-gray-600">{programSlides[slide].body}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {programSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-2.5 w-2.5 rounded-full ${i === slide ? 'bg-[#1a6b4a]' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSlide((p) => (p - 1 + programSlides.length) % programSlides.length)} className="h-10 w-10 rounded-full bg-[#1a6b4a] text-white">←</button>
              <button onClick={() => setSlide((p) => (p + 1) % programSlides.length)} className="h-10 w-10 rounded-full bg-[#1a6b4a] text-white">→</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-center text-3xl font-bold">Who we serve</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link href="/for-employers" className="rounded-xl border border-gray-200 p-6 hover:border-[#1a6b4a]">
            <h3 className="text-xl font-semibold">For Employers</h3>
            <p className="mt-2 text-sm text-gray-600">Build healthier, more engaged workforces.</p>
          </Link>
          <Link href="/for-health-plans" className="rounded-xl border border-gray-200 p-6 hover:border-[#1a6b4a]">
            <h3 className="text-xl font-semibold">For Health Plans</h3>
            <p className="mt-2 text-sm text-gray-600">Improve outcomes and member satisfaction.</p>
          </Link>
          <Link href="/for-consultants" className="rounded-xl border border-gray-200 p-6 hover:border-[#1a6b4a]">
            <h3 className="text-xl font-semibold">For Consultants</h3>
            <p className="mt-2 text-sm text-gray-600">Deliver differentiated benefits strategy.</p>
          </Link>
        </div>
      </section>

      <section className="bg-[#f5f9f7] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap gap-6 border-b border-gray-200 pb-3">
            {featureTabs.map((tab, i) => (
              <button
                key={tab.title}
                onClick={() => setActiveTab(i)}
                className={`pb-3 text-sm font-semibold ${activeTab === i ? 'border-b-2 border-[#1a6b4a] text-[#1a6b4a]' : 'text-gray-500'}`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-center">
            <p className="text-gray-700">{featureTabs[activeTab].text}</p>
            <img src={featureTabs[activeTab].image} alt={featureTabs[activeTab].title} className="w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">What leaders are saying</h2>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-lg text-gray-700">“{testimonials[testimonial].quote}”</p>
          <p className="mt-6 font-semibold text-[#1a6b4a]">{testimonials[testimonial].author}</p>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonial(i)}
              className={`h-2.5 w-2.5 rounded-full ${i === testimonial ? 'bg-[#1a6b4a]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#1a6b4a] py-20 text-center text-white">
        <h2 className="text-4xl font-bold">Ready to see our solutions in action?</h2>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3 px-6">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`rounded-full px-5 py-2 text-sm ${selectedRole === role ? 'bg-white text-[#1a6b4a]' : 'border border-white/50 text-white'}`}
            >
              {role}
            </button>
          ))}
        </div>
        <Link href="/contact" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-medium text-[#1a6b4a]">
          Get started
        </Link>
      </section>
    </main>
  )
}
