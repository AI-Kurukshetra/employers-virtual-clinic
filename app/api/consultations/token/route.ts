import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { consultationTokenSchema } from "@/lib/validations";
import { generateVideoToken } from "@/lib/twilio";
import { jsonError, jsonOk } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = consultationTokenSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parsedBody.data.appointmentId },
      include: {
        patient: { select: { id: true, userId: true } },
        provider: { select: { id: true, userId: true } },
      },
    });

    if (!appointment) return jsonError("Appointment not found", 404);

    const isPatient = session.user.role === "PATIENT" && session.user.patientId === appointment.patientId;
    const isProvider = session.user.role === "PROVIDER" && session.user.providerId === appointment.providerId;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isPatient && !isProvider && !isAdmin) {
      return jsonError("Forbidden", 403);
    }

    const roomName = appointment.videoRoomId || `appointment-${appointment.id}`;

    if (!appointment.videoRoomId) {
      await prisma.appointment.update({ where: { id: appointment.id }, data: { videoRoomId: roomName } });
    }

    const identity = `${session.user.role.toLowerCase()}-${session.user.id}`;
    const token = generateVideoToken(roomName, identity);

    return jsonOk({ token, roomName, identity, appointmentId: appointment.id });
  } catch (e) {
    return jsonError("Failed to generate consultation token", 500, { details: String(e) });
  }
}
