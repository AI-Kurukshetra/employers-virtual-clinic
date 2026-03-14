import { ProviderPrescriptionsClient } from "@/components/provider/prescriptions-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderPrescriptionsPage() {
  return (
    <ProviderShell title="Prescription Management">
      <ProviderPrescriptionsClient />
    </ProviderShell>
  );
}
