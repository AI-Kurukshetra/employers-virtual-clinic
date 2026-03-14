import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/shared/query-provider";

export const metadata: Metadata = {
  title: "Virtual Clinic",
  description: "Telehealth and care coordination platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
