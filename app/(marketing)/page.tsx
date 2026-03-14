'use client'

import { useEffect, useState } from 'react'

const tabs = [
  {
    key: 'Employers',
    image: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748cc59dace6a6b97d160_25b3070f42ece9984b7b4d36188298a3_industry-1.webp',
    body: 'Deliver modern, measurable, and equitable family benefits that reduce costs and improve workforce retention.',
  },
  {
    key: 'Health Plans',
    image: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748cc59dace6a6b97d15c_63ed56506fa539c9e4a8ebbf9882397e_industry-2.webp',
    body: 'Expand outcomes-driven care networks and improve member experience with integrated virtual-first services.',
  },
  {
    key: 'Consultants',
    image: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748cc59dace6a6b97d158_daea06e08fd870174aa8fbc88eb3182e_industry-3.webp',
    body: 'Support clients with evidence-backed recommendations and benchmark data for women and family health.',
  },
  {
    key: 'Employees',
    image: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748cc59dace6a6b97d154_5f1a0c59ae3d5f1ac1ae192533273210_industry-4.webp',
    body: 'Get personalized care anytime with specialists, coaching, and benefits navigation in one trusted app.',
  },
]

const testimonials = [
  {
    logo: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749ff13afda6cb55afaa7_264d5c01c81e5e87a1eda1996b16144f_microsoft.webp',
    quote:
      'We had amazing emotional support and saved around £30,000 that we were going to spend on IVF. The only difference was Maven. We didn\'t do anything else, and now we\'re pregnant.',
    name: 'Han',
    role: 'Maven member, Microsoft',
  },
  {
    logo: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749ff13afda6cb55afaa3_5fd4e3602dc6d21de5ff680098260117_amazon.webp',
    quote:
      'This is by far the easiest access to services and specialists that I\'ve experienced in the seven years of my family-building journey.',
    name: 'Sarah',
    role: 'Maven member, Amazon',
  },
  {
    logo: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749ff13afda6cb55afa9f_31e1a71daf98f8bbffb3c1f9085c9f70_vynamic.webp',
    quote:
      'Maven is deeply personal to me. As the head of talent, I was thrilled to bring Maven to Vynamic.',
    name: 'Mairead',
    role: 'Head of Talent, Vynamic',
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

export default function MarketingHomePage() {
  const [tab, setTab] = useState('Employers')
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0]

  return (
    <main className="overflow-x-hidden">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d2d1e] to-[#1a4a2e] px-4 text-center">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 opacity-20">
          <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748722f5193b59b97c29a_fd98d3239db6b066d65587ba90bfb935_4.webp" alt="" className="h-full w-full object-cover" />
          <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748722f5193b59b97c293_dfe52e86e53c7485add90cfb3ac36d33_3.webp" alt="" className="h-full w-full object-cover" />
          <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748722f5193b59b97c28c_08edb0bb0aa56ef8a9a1da10a20f27c0_2.webp" alt="" className="h-full w-full object-cover" />
          <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697748722f5193b59b97c285_22c514d33f7093633525307337b72924_1.webp" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-flex rounded-full bg-emerald-100/90 px-4 py-1 text-sm font-medium text-[#1a6b4a]">Evidence-based care</span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
            Evidence-based women&apos;s and family
            <br />
            <span className="italic text-[#4ade80]">healthcare</span>
          </h1>
          <p className="mt-5 text-xl text-gray-300">Expert care across every life stage.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="rounded-full bg-white px-8 py-3 font-medium text-[#1a6b4a]">Explore platform</a>
            <a href="#" className="rounded-full border border-white px-8 py-3 text-white">Get care</a>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 text-center">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold md:text-4xl">
            The women&apos;s and family care platform improving outcomes <span className="italic text-[#1a6b4a]">worldwide</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            Trusted by 2,000+ employers to deliver more affordable, personalized, and validated care—for everyone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#" className="rounded-full bg-[#1a6b4a] px-7 py-3 text-white">Get a demo</a>
            <a href="#" className="rounded-full border border-[#1a6b4a] px-7 py-3 text-[#1a6b4a]">Check eligibility</a>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749d643b9c945ff21b80b_e4ddf335638a14cea26a1273f0c318a8_card1.webp',
                title: 'Fertility & Family Building',
                body: 'Guiding members on the quickest, safest, and most affordable path to bringing home a healthy baby.',
              },
              {
                img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749d643b9c945ff21b807_8ec2eb2b695979fc2a37c402f59972f1_card2.webp',
                title: 'Maternity & Newborn Care',
                body: 'Providing proactive, continuous care to help families throughout pregnancy, postpartum, and return to work.',
              },
              {
                img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749d643b9c945ff21b80f_d15ff25b94d8a2afddedaeaf6c78dbbf_card3.webp',
                title: 'Parenting & Pediatrics',
                body: 'Helping parents navigate their child\'s development with 24/7 access to pediatric care and expert support.',
              },
              {
                img: 'https://cdn.prod.website-files.com/5fb2b678e994739660d95086/697749d643b9c945ff21b813_bcc7de9b8e5fcf3fd1be8ffc384b7eae_card4.webp',
                title: 'Menopause & Midlife Health',
                body: 'Empowering members to thrive in midlife, both personally and professionally, with holistic care.',
              },
            ].map((card) => (
              <article key={card.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white text-left transition-shadow hover:shadow-lg">
                <img src={card.img} alt={card.title} className="h-44 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.body}</p>
                  <a href="#" className="text-sm font-medium text-[#1a6b4a]">Learn more →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f9f7] py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold md:text-4xl">
            24/7 virtual care, predictive insights, &amp; employee benefit details—
            <span className="italic text-[#1a6b4a]"> all in one place</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            Meet the world&apos;s most innovative healthcare platform, combining clinical precision, administrative ease, and AI-native technology.
          </p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl bg-[#1a6b4a] p-8 text-white lg:col-span-2 lg:min-h-[360px]">
              <h3 className="max-w-xl text-2xl font-semibold">The largest virtual care network, supporting 28 million lives worldwide</h3>
              <p className="mt-3 text-white/80">Your trusted partner in high-quality, 24/7/365 healthcare</p>
              <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/69774898b476129139df3112_3acc56ff9ea6122d730a03fbd1cccaa9_features-1.webp" alt="network" className="absolute bottom-0 right-0 h-48 w-auto object-contain" />
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-8">
              <h3 className="text-xl font-semibold">30+ provider specialties</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Nutritionist', 'Doula Support', 'Lactation Consultant'].map((pill) => (
                  <span key={pill} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-[#1a6b4a]">{pill}</span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">Including 52% clinically licensed and 48% certified</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-8 lg:col-start-3">
              <h3 className="text-xl font-semibold">Global care, coverage, and reimbursement across 175+ countries</h3>
              <img src="https://cdn.prod.website-files.com/5fb2b678e994739660d95086/698629b9a6b3fca453ff4e88_globe-fr-ca.svg" alt="globe" className="mt-4 h-36 w-full object-contain" />
              <p className="mt-3 text-sm text-slate-600">Milliman-validated outcomes, proven by employer and health plan claims-based studies</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24" style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/694d5ad8def28e394a06bd94/694d5ad8def28e394a06be41_parallex-desktop.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-6xl px-4">
          <h2 className="text-center text-4xl font-semibold text-white">
            Lowering costs by <span className="text-[#4ade80]">improving care</span>
          </h2>
          <div className="mt-12 grid gap-8 text-center md:grid-cols-2 xl:grid-cols-4">
            {[
              ['27%', 'Up to 27% lower NICU admissions'],
              ['57%', 'Up to 57% of members report Maven helped them return to work'],
              ['30%', 'Among fertility members, 30% achieve pregnancy without ART'],
              ['21%', 'Up to 21% of members reported improved maternal mental health'],
            ].map(([num, txt]) => (
              <div key={num}>
                <p className="text-5xl font-bold text-white">{num}</p>
                <p className="mt-2 text-sm text-white/90">{txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-4xl font-semibold">
            Making healthcare work <span className="italic text-[#1a6b4a]">for all of us</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-b border-gray-100 pb-3">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} type="button" className={`pb-2 text-sm ${tab === t.key ? 'border-b-2 border-[#1a6b4a] font-semibold text-[#1a6b4a]' : 'text-slate-500'}`}>
                {t.key}
              </button>
            ))}
          </div>
          <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
            <p className="text-left text-lg text-slate-600">{activeTab.body}</p>
            <img src={activeTab.image} alt={activeTab.key} className="h-80 w-full rounded-2xl object-cover" />
          </div>
          <a href="#" className="mt-8 inline-block rounded-full bg-[#1a6b4a] px-7 py-3 text-white">See if your company offers Virtual Clinic</a>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="mb-6 text-sm text-slate-500">Trusted by</p>
          <div className="marquee overflow-hidden">
            <div className="marquee-track flex w-max gap-12">
              {[...logos, ...logos].map((logo, i) => (
                <img key={`${logo}-${i}`} src={logo} alt="logo" className="h-8 w-auto grayscale transition hover:grayscale-0" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f9f7] py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-semibold">Real stories from Maven members</h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            Discover how our personalized healthcare platform has transformed the lives of women and families worldwide.
          </p>
          <a href="#" className="mt-4 inline-block text-[#1a6b4a]">Meet our members →</a>

          <div className="mt-10 rounded-3xl bg-white p-8 text-left shadow-sm">
            <img src={testimonials[slide].logo} alt="company" className="h-9 w-auto" />
            <p className="mt-6 text-xl leading-relaxed text-slate-800">“{testimonials[slide].quote}”</p>
            <p className="mt-6 font-semibold">{testimonials[slide].name}</p>
            <p className="text-sm text-slate-500">{testimonials[slide].role}</p>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} type="button" onClick={() => setSlide(i)} className={`h-2.5 w-2.5 rounded-full ${slide === i ? 'bg-[#1a6b4a]' : 'bg-slate-300'}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1a6b4a] py-24 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-4xl font-bold text-white">
            Bring your benefits into
            <br />
            <span className="italic text-emerald-300">the future</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#" className="rounded-full bg-white px-8 py-3 text-[#1a6b4a]">For businesses</a>
            <a href="#" className="rounded-full border border-white px-8 py-3 text-white">For employees</a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .marquee-track {
          animation: marquee 28s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  )
}
