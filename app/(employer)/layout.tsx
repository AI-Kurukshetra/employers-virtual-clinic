import { AppHeader } from "@/components/shared/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        homeHref="/employer/dashboard"
        brand="Maven Employer"
        navItems={[
          { href: "/employer/dashboard", label: "Dashboard" },
          { href: "/employer/employees", label: "Employees" },
          { href: "/employer/billing", label: "Billing" },
        ]}
      />
      <main>{children}</main>
    </div>
  );
}
