import Link from "next/link";
import { UserMenu } from "@/components/shared/user-menu";

type NavItem = { href: string; label: string };

export function AppHeader({
  homeHref,
  brand,
  navItems,
}: {
  homeHref: string;
  brand: string;
  navItems: NavItem[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link href={homeHref} className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-bold text-white">
            M
          </span>
          <span className="font-semibold tracking-tight">{brand}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
