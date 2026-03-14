import { ProviderDashboardClient } from "@/components/provider/dashboard-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderDashboardPage() {
  return (
    <ProviderShell title="Provider Dashboard">
      <ProviderDashboardClient />
    </ProviderShell>
  );
}
