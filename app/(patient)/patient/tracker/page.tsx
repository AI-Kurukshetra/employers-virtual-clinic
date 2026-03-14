import { PatientShell } from "@/components/patient/patient-shell";
import { PatientTrackerClient } from "@/components/patient/tracker-client";

export default function PatientTrackerPage() {
  return (
    <PatientShell title="Tracker">
      <PatientTrackerClient />
    </PatientShell>
  );
}
