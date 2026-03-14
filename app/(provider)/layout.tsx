import { AppHeader } from "@/components/shared/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        homeHref="/provider/dashboard"
        brand="Maven Provider"
        navItems={[
          { href: "/provider/dashboard", label: "Dashboard" },
          { href: "/provider/patients", label: "Patients" },
          { href: "/provider/prescriptions", label: "Prescriptions" },
          { href: "/provider/care-plans", label: "Care Plans" },
          { href: "/provider/schedule", label: "Schedule" },
        ]}
      />
      <main>{children}</main>
    </div>
  );
}
