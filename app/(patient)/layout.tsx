import { AppHeader } from "@/components/shared/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        homeHref="/patient/dashboard"
        brand="Maven Health"
        navItems={[
          { href: "/patient/dashboard", label: "Dashboard" },
          { href: "/patient/appointments", label: "Appointments" },
          { href: "/patient/tracker", label: "Tracker" },
          { href: "/patient/messages", label: "Messages" },
        ]}
      />
      <main>{children}</main>
    </div>
  );
}
