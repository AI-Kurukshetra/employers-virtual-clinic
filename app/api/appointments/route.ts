import { NextRequest } from "next/server";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentFiltersSchema, createAppointmentSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

function parseQuery(req: NextRequest) {
  return appointmentFiltersSchema.safeParse({
    status: req.nextUrl.searchParams.get("status") ?? undefined,
    fromDate: req.nextUrl.searchParams.get("fromDate") ?? undefined,
    toDate: req.nextUrl.searchParams.get("toDate") ?? undefined,
    providerId: req.nextUrl.searchParams.get("providerId") ?? undefined,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    const parsedQuery = parseQuery(req);
    if (!parsedQuery.success) {
      return jsonError("Invalid query params", 422, { issues: parsedQuery.error.flatten() });
    }

    const where: Prisma.AppointmentWhereInput = {};
    const { status, fromDate, toDate, providerId } = parsedQuery.data;

    if (session.user.role === "PATIENT") {
      if (!session.user.patientId) return jsonError("Patient profile not found", 404);
      where.patientId = session.user.patientId;
    }

    if (session.user.role === "PROVIDER") {
      if (!session.user.providerId) return jsonError("Provider profile not found", 404);
      where.providerId = session.user.providerId;
    }

    if (status) where.status = status;
    if (providerId && session.user.role !== "PROVIDER") where.providerId = providerId;
    if (fromDate || toDate) {
      where.scheduledAt = {
        gte: fromDate,
        lte: toDate,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        provider: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return jsonOk(appointments, { count: appointments.length });
  } catch (e) {
    return jsonError("Failed to fetch appointments", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = createAppointmentSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const payload = parsedBody.data;
    if (payload.scheduledAt <= new Date()) {
      return jsonError("scheduledAt must be in the future", 422);
    }

    const patientId =
      session.user.role === "PATIENT"
        ? session.user.patientId
        : payload.patientId;

    if (!patientId) return jsonError("patientId is required", 422);

    if (session.user.role === "PATIENT" && payload.patientId && payload.patientId !== session.user.patientId) {
      return jsonError("Forbidden", 403);
    }

    if (session.user.role === "PROVIDER" && payload.providerId !== session.user.providerId) {
      return jsonError("Providers can only create appointments for themselves", 403);
    }

    const provider = await prisma.provider.findUnique({ where: { id: payload.providerId } });
    if (!provider || !provider.acceptingPatients) {
      return jsonError("Provider unavailable", 422);
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { id: true } });
    if (!patient) return jsonError("Patient not found", 404);

    const start = payload.scheduledAt;
    const end = new Date(start.getTime() + payload.duration * 60 * 1000);

    const existing = await prisma.appointment.findMany({
      where: {
        providerId: payload.providerId,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
        scheduledAt: {
          gte: new Date(start.getTime() - 2 * 60 * 60 * 1000),
          lte: end,
        },
      },
      select: { id: true, scheduledAt: true, duration: true },
    });

    const hasConflict = existing.some((appt) => {
      const apptStart = appt.scheduledAt;
      const apptEnd = new Date(apptStart.getTime() + appt.duration * 60 * 1000);
      return start < apptEnd && end > apptStart;
    });

    if (hasConflict) return jsonError("Provider already booked for this slot", 409);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        providerId: payload.providerId,
        type: payload.type,
        scheduledAt: payload.scheduledAt,
        duration: payload.duration,
        chiefComplaint: payload.chiefComplaint,
        notes: payload.notes,
        videoRoomId: crypto.randomUUID(),
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        provider: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    });

    return jsonOk(appointment, {}, 201);
  } catch (e) {
    return jsonError("Failed to create appointment", 500, { details: String(e) });
  }
}
