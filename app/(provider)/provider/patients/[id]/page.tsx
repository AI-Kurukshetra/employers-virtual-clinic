import { PatientChartClient } from "@/components/provider/patient-chart-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default async function ProviderPatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProviderShell title="Patient Chart">
      <PatientChartClient patientId={id} />
    </ProviderShell>
  );
}
