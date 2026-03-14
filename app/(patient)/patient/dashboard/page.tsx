import { PatientDashboardClient } from "@/components/patient/dashboard-client";
import { PatientShell } from "@/components/patient/patient-shell";

export default function PatientDashboardPage() {
  return (
    <PatientShell title="Dashboard">
      <PatientDashboardClient />
    </PatientShell>
  );
}
