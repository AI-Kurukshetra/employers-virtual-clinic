import { PatientAppointmentsClient } from "@/components/patient/appointments-client";
import { PatientShell } from "@/components/patient/patient-shell";

export default function PatientAppointmentsPage() {
  return (
    <PatientShell title="Appointments">
      <PatientAppointmentsClient />
    </PatientShell>
  );
}
