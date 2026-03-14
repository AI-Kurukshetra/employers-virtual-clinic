import { NextRequest } from "next/server";
import { LabStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { labSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const where: Prisma.LabResultWhereInput =
      session.user.role === "PATIENT"
        ? { patientId: session.user.patientId ?? "" }
        : { appointment: { providerId: session.user.providerId ?? "" } };

    if ((session.user.role === "PATIENT" && !session.user.patientId) || (session.user.role === "PROVIDER" && !session.user.providerId)) {
      return jsonError("Profile not found", 404);
    }

    const results = await prisma.labResult.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        appointment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(results, { count: results.length });
  } catch (e) {
    return jsonError("Failed to fetch lab results", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireSession(["PROVIDER"]);
    if (error) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = labSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const labOrder = await prisma.labResult.create({
      data: {
        ...parsedBody.data,
        status: LabStatus.ORDERED,
        orderedAt: new Date(),
      },
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        appointment: true,
      },
    });

    return jsonOk(labOrder, { integration: "mock-labcorp", ordered: true }, 201);
  } catch (e) {
    return jsonError("Failed to order lab test", 500, { details: String(e) });
  }
}
