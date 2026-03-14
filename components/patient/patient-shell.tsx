import Link from "next/link";

export function PatientShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f7ff_0%,#eefdf8_46%,#f8fbff_100%)]">
      <section className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-2">
          <Link href="/patient/dashboard" className="text-xs text-slate-500 hover:text-slate-700">
            Patient Area
          </Link>
        </div>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {children}
      </section>
    </main>
  );
}
