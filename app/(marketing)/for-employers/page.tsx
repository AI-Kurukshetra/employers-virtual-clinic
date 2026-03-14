'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const programSlides = [
  {
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff6542ee887e_father-and-son.webp',
    title: 'Fertility & Family Building',
    body: 'Virtual Clinic guides members on the quickest, safest, and most affordable path to bringing home a healthy baby through high-quality fertility care and transparent coverage—no matter how they choose to build their families.',
  },
  {
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff15f2ee8878_maven-family.webp',
    title: 'Maternity & Newborn Care',
    body: 'From pregnancy through postpartum and return to work, members receive personalized, 24/7 care from OB-GYNs, doulas, lactation consultants, career coaches, and more. Virtual Clinic is the only solution that delivers a continuous experience with up to 4x ROI.',
  },
  {
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff49d3ee888c_maven_parents-and-pediatrics_employers.webp',
    title: 'Parenting & Pediatrics',
    body: "Virtual Clinic makes being a working parent easier by providing 24/7 access to pediatric care, parenting experts, guided curriculums, special needs support, childcare resources, and more.",
  },
  {
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff3efcee8881_woman-look-window.webp',
    title: 'Menopause & Midlife Health',
    body: 'Virtual Clinic helps members in midlife thrive personally and professionally by providing holistic menopause benefits for their physical, emotional, and sexual health.',
  },
]

const logos = [
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b90203_1f5d918b2d606abebe1697afafb87b50_logo1.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b90202_87fd0f01d47b2146d42f987c8308473a_logo3.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b90201_6e32cd11fe121c4cfafacd6dfd558671_logo4.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b90200_74f68f85652b183ca7ed601f34f293e4_logo5.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b901ff_2906491d5b86bc348b3fa7beae34b1c5_logo6.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b901fe_84100e75a142811244cb212606f8f80c_logo7.svg',
  'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774a4f7e306b0cc7b901fd_6cd42ac7e02dddbbbc628844ee1cd908_logo8.svg',
]

const howItWorksTabs = [
  {
    title: 'Benefit Management',
    content:
      "Flexible benefit design and an easy-to-use payment platform to meet your organization's needs—from fertility benefit administration to reimbursements for adoption, surrogacy, or doula care.",
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf15aef06ff90f6ee88b5_tab1_employers.webp',
  },
  {
    title: 'Care Advocacy & Navigation',
    content:
      'Members connect with a real person who helps them curate a team of specialists based on their preferences, meet health goals, navigate their company benefits.',
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf15aef06ff389eee88ba_tab2_employers.webp',
  },
  {
    title: 'Virtual Care',
    content:
      'Members have 24/7 access to providers across 30+ specialties, including mental health providers, doulas, nutritionists, and fertility awareness educators.',
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf15aef06ff91fcee88bf_tab3_employers.webp',
  },
  {
    title: 'Content & Community',
    content:
      'Personalized content libraries containing articles, quizzes, live and on-demand classes, peer-to-peer communities—all tailored to meet members where they are on their journey.',
    img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf15aef06ffaeb3ee88c4_tab4_employers.webp',
  },
]

export default function ForEmployersPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % programSlides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-white text-gray-900">
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-5 md:items-center">
        <div className="md:col-span-3 space-y-6">
          <span className="inline-block rounded-full bg-[#e9f5ef] px-4 py-1 text-sm font-medium text-[#1a6b4a]">For Employers</span>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Transforming women&apos;s and family healthcare
            <br />
            for employees everywhere
          </h1>
          <p className="max-w-2xl text-xl text-gray-600">Partnering with leading employers to improve outcomes for global workforces</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="rounded-full bg-[#1a6b4a] px-8 py-3 font-medium text-white">
              Book a demo
            </Link>
            <Link href="/solutions" className="rounded-full border border-[#1a6b4a] px-8 py-3 font-medium text-[#1a6b4a]">
              Explore our solutions
            </Link>
          </div>
        </div>
        <div className="md:col-span-2">
          <img
            src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf030b2f86aead697448d_for-employeers-hero.webp"
            alt="For employers"
            className="h-auto w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="bg-[#f5f9f7] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold">Better care can&apos;t wait</h2>
          <p className="mt-4 max-w-4xl text-gray-600">
            Employees today want a workplace and benefits that support their physical, emotional, financial, and professional needs—across every phase of their fertility and reproductive health journeys.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold text-[#1a6b4a]">57%</p>
              <p className="mt-3 text-sm text-gray-600">of employees have taken, or might take, a new job because it offered better reproductive and family benefits</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#1a6b4a]">49%</p>
              <p className="mt-3 text-sm text-gray-600">of LGBTQIA+ professionals won&apos;t work for a company without LGBTQIA+-friendly benefits</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#1a6b4a]">40%</p>
              <p className="mt-3 text-sm text-gray-600">of employees report that menopause interferes with work weekly</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-500">Sources: LinkedIn, State of Family Health Benefits Report</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold">End-to-end support for your employees—all in one place</h2>
        <div className="mt-10 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <img src={programSlides[currentSlide].img} alt={programSlides[currentSlide].title} className="h-full w-full object-cover" />
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold">{programSlides[currentSlide].title}</h3>
              <p className="mt-4 text-gray-600">{programSlides[currentSlide].body}</p>
              <a href="#" className="mt-6 inline-block font-medium text-[#1a6b4a]">
                Learn more →
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {programSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 w-2.5 rounded-full ${idx === currentSlide ? 'bg-[#1a6b4a]' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + programSlides.length) % programSlides.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a6b4a] text-white"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % programSlides.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a6b4a] text-white"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mx-auto max-w-4xl text-3xl font-bold">2,000+ leading employers trust Virtual Clinic to create great employee experiences</h2>
          <div className="mt-10 overflow-hidden">
            <div className="marquee flex w-max gap-12">
              {[...logos, ...logos].map((logo, idx) => (
                <img key={idx} src={logo} alt="Employer logo" className="h-10 w-auto grayscale" />
              ))}
            </div>
          </div>
          <Link href="#" className="mt-8 inline-block font-medium text-[#1a6b4a]">
            Hear from our clients →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold">Improve outcomes for your workforce. Change the health of the world.</h2>
        <p className="mt-4 max-w-3xl text-gray-600">Provide exceptional care for your employees—and drive impactful business results for your organization.</p>

        <div className="mt-14 space-y-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff1696ee88a2_maven_deliver-on-DEI%201.webp" alt="Drive better outcomes" className="rounded-2xl" />
            <div>
              <p className="text-sm font-semibold text-[#1a6b4a]">01</p>
              <h3 className="mt-2 text-2xl font-bold">Drive better outcomes</h3>
              <p className="mt-4 text-gray-600">Our high-touch approach ensures employees receive preventative, proactive, and continuous care along their reproductive health journey, effectively improving outcomes and lowering costs.</p>
            </div>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[#1a6b4a]">02</p>
              <h3 className="mt-2 text-2xl font-bold">Attract and retain talent</h3>
              <p className="mt-4 text-gray-600">When the care is better, your employees show up better. With Virtual Clinic, organizations report higher employee engagement and productivity.</p>
            </div>
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ffa615ee887c_leading-platform-image.webp" alt="Attract and retain talent" className="rounded-2xl" />
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff3d6dee88a5_maven_global-benefits-paraty%201.webp" alt="Global benefits parity" className="rounded-2xl" />
            <div>
              <p className="text-sm font-semibold text-[#1a6b4a]">03</p>
              <h3 className="mt-2 text-2xl font-bold">Achieve global benefits parity</h3>
              <p className="mt-4 text-gray-600">Going beyond translation services, we connect members in 175+ countries with people who speak their language, understand their culture, and are experts in their local health system.</p>
            </div>
          </div>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[#1a6b4a]">04</p>
              <h3 className="mt-2 text-2xl font-bold">Build inclusive workplaces</h3>
              <p className="mt-4 text-gray-600">Health equity is core to our care model. By supporting diverse paths to parenthood and overlooked phases like menopause and midlife, we help companies build more inclusive workplaces.</p>
            </div>
            <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf159ef06ff2130ee88a8_maven_deliver-better-outcomes%201.webp" alt="Build inclusive workplaces" className="rounded-2xl" />
          </div>
        </div>

        <Link href="/contact" className="mt-12 inline-block rounded-full bg-[#1a6b4a] px-8 py-3 font-medium text-white">
          Contact us to get a personalized demo
        </Link>
      </section>

      <section className="bg-[#f5f9f7] py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-2 md:items-center">
          <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/637bf15aef06ffab23ee88ab_Maven_best-choice.webp" alt="Results" className="rounded-2xl" />
          <div>
            <h2 className="text-3xl font-bold">Making a real difference for your people and your business</h2>
            <p className="mt-4 text-gray-600">A benefit that leads to healthier employees and better business outcomes</p>
            <div className="mt-8 space-y-5">
              <p><span className="font-bold text-[#1a6b4a]">Up to 15%</span> lower C-section rates</p>
              <p><span className="font-bold text-[#1a6b4a]">40%+</span> of members reported finding emotional support through Virtual Clinic&apos;s high-touch 1:1 mental health coaching</p>
              <p><span className="font-bold text-[#1a6b4a]">30%</span> of members who are struggling to conceive achieve pregnancy without assisted reproductive technology</p>
              <p><span className="font-bold text-[#1a6b4a]">96%</span> of Family Building members are more loyal to employers because they implemented Virtual Clinic</p>
              <p><span className="font-bold text-[#1a6b4a]">94%</span> of members report that Virtual Clinic helped them return or plan their return to work</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold">How Virtual Clinic delivers better care</h2>
        <p className="mt-4 text-gray-600">One women&apos;s and family health benefits partner employers trust.</p>

        <div className="mt-8 flex flex-wrap gap-6 border-b border-gray-200">
          {howItWorksTabs.map((tab, idx) => (
            <button
              key={tab.title}
              onClick={() => setActiveTab(idx)}
              className={`pb-3 text-sm font-medium ${
                activeTab === idx ? 'border-b-2 border-[#1a6b4a] text-[#1a6b4a]' : 'text-gray-500'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
          <p className="text-gray-700">{howItWorksTabs[activeTab].content}</p>
          <img src={howItWorksTabs[activeTab].img} alt={howItWorksTabs[activeTab].title} className="rounded-2xl" />
        </div>
      </section>

      <section className="bg-[#1a6b4a] py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-bold text-white">Let&apos;s deliver exceptional healthcare together</h2>
          <p className="mt-4 text-green-200">Contact us to schedule a demo.</p>
          <Link href="/contact" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-medium text-[#1a6b4a]">
            Get in touch
          </Link>
        </div>
      </section>

      <style jsx>{`
        .marquee {
          animation: marquee 28s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
