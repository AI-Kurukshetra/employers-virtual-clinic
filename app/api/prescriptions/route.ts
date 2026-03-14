import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { prescriptionSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const where: Prisma.PrescriptionWhereInput =
      session.user.role === "PATIENT"
        ? { patientId: session.user.patientId ?? "" }
        : { providerId: session.user.providerId ?? "" };

    if ((session.user.role === "PATIENT" && !session.user.patientId) || (session.user.role === "PROVIDER" && !session.user.providerId)) {
      return jsonError("Profile not found", 404);
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        provider: { include: { user: { select: { id: true, email: true, role: true } } } },
        appointment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(prescriptions, { count: prescriptions.length });
  } catch (e) {
    return jsonError("Failed to fetch prescriptions", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = prescriptionSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const patient = await prisma.patient.findUnique({ where: { id: parsedBody.data.patientId }, select: { id: true } });
    if (!patient) return jsonError("Patient not found", 404);

    const prescription = await prisma.prescription.create({
      data: {
        ...parsedBody.data,
        providerId: session.user.providerId,
        refillsRemaining: parsedBody.data.refills,
      },
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        provider: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    });

    return jsonOk(prescription, {}, 201);
  } catch (e) {
    return jsonError("Failed to create prescription", 500, { details: String(e) });
  }
}
