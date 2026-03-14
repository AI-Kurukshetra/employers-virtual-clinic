import { ConsultationRoom } from "@/components/consultation/consultation-room";

export default async function PatientConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  return <ConsultationRoom appointmentId={appointmentId} role="PATIENT" />;
}
