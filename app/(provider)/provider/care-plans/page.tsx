import { ProviderCarePlansClient } from "@/components/provider/care-plans-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderCarePlansPage() {
  return (
    <ProviderShell title="Care Plan Builder">
      <ProviderCarePlansClient />
    </ProviderShell>
  );
}
