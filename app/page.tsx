import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Menu } from "lucide-react";

const programs = [
  {
    title: "Fertility & family building",
    copy: "Personalized care navigation, virtual visits, and guided treatment support across every step.",
    image: "/illustrations/patient-care.svg",
  },
  {
    title: "Maternity & newborn care",
    copy: "24/7 clinical messaging, symptom triage, and postpartum planning from trusted providers.",
    image: "/illustrations/provider-workspace.svg",
  },
  {
    title: "Women’s and family health",
    copy: "Integrated care for hormones, pediatrics, mental health, and preventive programs.",
    image: "/illustrations/employer-insights.svg",
  },
];

const stats = [
  { label: "Member satisfaction", value: "4.8/5" },
  { label: "Average first response", value: "< 5 min" },
  { label: "Covered specialties", value: "30+" },
  { label: "Employer retention", value: "92%" },
];

const testimonials = [
  {
    quote: "Our teams finally have one place for support, coaching, and clinical care.",
    author: "People Ops Leader",
    company: "Growth-stage technology company",
  },
  {
    quote: "The provider experience is fast and clean, and patients feel guided every visit.",
    author: "Clinical Director",
    company: "Multi-site care network",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbfd] text-slate-900">
      <Image src="/illustrations/home-feature-bg.svg" alt="Healthcare background" fill className="object-cover opacity-80" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/45 to-[#eaf8ff]/75" />

      <div className="relative">
        <div className="bg-slate-900 px-4 py-2 text-center text-xs font-medium text-white">
          New: Family care programs now available for employers and individuals
        </div>

        <header className="border-b border-white/40 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Virtual Clinic
            </Link>
            <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
              <Link href="#" className="transition hover:text-cyan-700">
                Programs
              </Link>
              <Link href="#" className="transition hover:text-cyan-700">
                For employers
              </Link>
              <Link href="#" className="transition hover:text-cyan-700">
                For providers
              </Link>
              <Link href="#" className="transition hover:text-cyan-700">
                Resources
              </Link>
              <Link href="#" className="transition hover:text-cyan-700">
                Company
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium md:inline-flex">
                Login
              </Link>
              <Link href="/register" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500">
                Get started
              </Link>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white md:hidden" type="button">
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-12 pb-14 md:grid-cols-[1.05fr_0.95fr] md:pt-16">
          <div className="card-enter space-y-6">
            <p className="inline-flex rounded-full border border-cyan-200/70 bg-cyan-100/75 px-3 py-1 text-xs font-semibold text-cyan-700">
              Family and women’s health platform
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              Healthcare that feels personal, connected, and always on.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-700 md:text-lg">
              Support members and patients through fertility, maternity, pediatrics, and ongoing wellness with one modern virtual clinic.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-500">
                Request demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold">
                Sign in
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["24/7 clinical messaging", "Personalized care plans", "Integrated provider workflows", "Employer-level analytics"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="card-enter grid gap-3 sm:grid-cols-2">
            <div className="surface-glass rounded-2xl p-3 sm:col-span-2">
              <Image src="/illustrations/provider-workspace.svg" alt="Care team dashboard" width={640} height={480} className="float-gentle h-auto w-full rounded-xl" />
            </div>
            <div className="surface-glass rounded-2xl p-3">
              <Image src="/illustrations/patient-care.svg" alt="Patient app view" width={640} height={480} className="h-auto w-full rounded-xl" />
            </div>
            <div className="surface-glass rounded-2xl p-3">
              <Image src="/illustrations/employer-insights.svg" alt="Employer analytics" width={640} height={480} className="h-auto w-full rounded-xl" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="card-enter rounded-[2rem] border border-white/55 bg-white/78 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.08em] text-cyan-700 uppercase">Programs</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Comprehensive care features</h2>
              </div>
              <Link href="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
                Explore all programs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {programs.map((program) => (
                <article key={program.title} className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Image src={program.image} alt={program.title} width={640} height={480} className="h-44 w-full rounded-xl object-cover" />
                  <h3 className="mt-4 text-lg font-semibold">{program.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="card-enter grid gap-4 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/55 bg-white/82 p-5 text-center backdrop-blur-lg">
                <p className="text-3xl font-semibold text-cyan-700">{item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="card-enter grid gap-4 md:grid-cols-2">
            {testimonials.map((item) => (
              <article key={item.author} className="rounded-2xl border border-white/55 bg-white/82 p-6 backdrop-blur-xl">
                <p className="text-lg leading-relaxed text-slate-800">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold">{item.author}</p>
                <p className="text-sm text-slate-600">{item.company}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="card-enter rounded-[2rem] border border-white/55 bg-gradient-to-r from-cyan-600 to-teal-500 p-8 text-white md:p-10">
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Build a healthier workforce and member experience.</h2>
                <p className="mt-2 max-w-2xl text-sm text-cyan-50 md:text-base">
                  Launch coordinated virtual care with rich dashboards for patients, providers, and employers.
                </p>
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/50 bg-white/65">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600">
            <p>© 2026 Virtual Clinic</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="#" className="hover:text-slate-900">
                Terms
              </Link>
              <Link href="#" className="hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
