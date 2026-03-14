import { NextRequest } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentStatusPatchSchema, idParamSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

async function getAuthorizedAppointment(id: string, user: { id: string; role: string; patientId?: string | null; providerId?: string | null }) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { id: true, email: true, role: true } } } },
      provider: { include: { user: { select: { id: true, email: true, role: true } } } },
      prescriptions: true,
      labResults: true,
      referrals: true,
    },
  });

  if (!appointment) return { appointment: null, error: jsonError("Appointment not found", 404) };

  if (user.role === "PATIENT" && appointment.patientId !== user.patientId) {
    return { appointment: null, error: jsonError("Forbidden", 403) };
  }

  if (user.role === "PROVIDER" && appointment.providerId !== user.providerId) {
    return { appointment: null, error: jsonError("Forbidden", 403) };
  }

  return { appointment, error: null };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid appointment id", 422, { issues: parsedParams.error.flatten() });
    }

    const { appointment, error: appointmentError } = await getAuthorizedAppointment(parsedParams.data.id, session.user);
    if (appointmentError || !appointment) return appointmentError;

    return jsonOk(appointment);
  } catch (e) {
    return jsonError("Failed to fetch appointment", 500, { details: String(e) });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid appointment id", 422, { issues: parsedParams.error.flatten() });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = appointmentStatusPatchSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }
    if (!parsedBody.data.status && typeof parsedBody.data.notes !== "string") {
      return jsonError("At least one of status or notes is required", 422);
    }

    const { appointment, error: appointmentError } = await getAuthorizedAppointment(parsedParams.data.id, session.user);
    if (appointmentError || !appointment) return appointmentError;

    if (typeof parsedBody.data.notes === "string" && session.user.role !== "PROVIDER") {
      return jsonError("Only providers can update appointment notes", 403);
    }

    const updated = await prisma.appointment.update({
      where: { id: parsedParams.data.id },
      data: {
        status: parsedBody.data.status,
        notes: typeof parsedBody.data.notes === "string" ? parsedBody.data.notes : undefined,
      },
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        provider: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    });

    if (parsedBody.data.status && appointment.status !== parsedBody.data.status) {
      await prisma.notification.createMany({
        data: [
          {
            userId: appointment.patient.userId,
            type: "APPOINTMENT_STATUS_CHANGED",
            title: "Appointment status updated",
            body: `Your appointment status changed from ${appointment.status} to ${parsedBody.data.status}.`,
            metadata: { appointmentId: appointment.id, status: parsedBody.data.status },
            sentAt: new Date(),
          },
          {
            userId: appointment.provider.userId,
            type: "APPOINTMENT_STATUS_CHANGED",
            title: "Appointment status updated",
            body: `Appointment status changed from ${appointment.status} to ${parsedBody.data.status}.`,
            metadata: { appointmentId: appointment.id, status: parsedBody.data.status },
            sentAt: new Date(),
          },
        ],
      });
    }

    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to update appointment", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return PATCH(req, context);
  } catch (e) {
    return jsonError("Failed to update appointment", 500, { details: String(e) });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid appointment id", 422, { issues: parsedParams.error.flatten() });
    }

    const { appointment, error: appointmentError } = await getAuthorizedAppointment(parsedParams.data.id, session.user);
    if (appointmentError || !appointment) return appointmentError;

    const cancelled = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return jsonOk(cancelled);
  } catch (e) {
    return jsonError("Failed to cancel appointment", 500, { details: String(e) });
  }
}
