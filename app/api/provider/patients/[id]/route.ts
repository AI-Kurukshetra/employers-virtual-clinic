import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { idParamSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const parsed = idParamSchema.safeParse(await context.params);
    if (!parsed.success) return jsonError("Invalid patient id", 422, { issues: parsed.error.flatten() });

    const patientId = parsed.data.id;

    const isAssigned = await prisma.appointment.findFirst({
      where: {
        patientId,
        providerId: session.user.providerId,
      },
      select: { id: true },
    });

    if (!isAssigned) return jsonError("Forbidden", 403);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { id: true, email: true } },
        appointments: {
          where: { providerId: session.user.providerId },
          include: { provider: { include: { user: { select: { email: true } } } } },
          orderBy: { scheduledAt: "desc" },
        },
        symptomLogs: { orderBy: { date: "asc" } },
        cycleTracks: { orderBy: { periodStart: "asc" } },
        prescriptions: { where: { providerId: session.user.providerId }, orderBy: { createdAt: "desc" } },
        labResults: { orderBy: { createdAt: "desc" } },
        carePlans: { where: { providerId: session.user.providerId }, orderBy: { createdAt: "desc" } },
        mentalHealthAssessments: { orderBy: { completedAt: "desc" } },
      },
    });

    if (!patient) return jsonError("Patient not found", 404);

    return jsonOk(patient);
  } catch (e) {
    return jsonError("Failed to fetch patient chart", 500, { details: String(e) });
  }
}
