import { ProviderPatientsClient } from "@/components/provider/patients-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderPatientsPage() {
  return (
    <ProviderShell title="Patients">
      <ProviderPatientsClient />
    </ProviderShell>
  );
}
