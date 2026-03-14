import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cycleSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["PATIENT"]);
    if (error || !session) return error;

    if (!session.user.patientId) return jsonError("Patient profile not found", 404);

    const cycles = await prisma.cycleTrack.findMany({
      where: { patientId: session.user.patientId },
      take: 12,
      orderBy: { periodStart: "desc" },
    });

    const validLengths = cycles.flatMap((c) => (typeof c.cycleLength === "number" ? [c.cycleLength] : []));
    const averageCycleLength =
      validLengths.length > 0
        ? validLengths.reduce((sum, length) => sum + length, 0) / validLengths.length
        : null;

    return jsonOk(cycles, { averageCycleLength, count: cycles.length });
  } catch (e) {
    return jsonError("Failed to fetch cycles", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT"]);
    if (error || !session) return error;

    if (!session.user.patientId) return jsonError("Patient profile not found", 404);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = cycleSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const existingSameStart = await prisma.cycleTrack.findFirst({
      where: {
        patientId: session.user.patientId,
        periodStart: parsedBody.data.periodStart,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingSameStart) {
      const updated = await prisma.cycleTrack.update({
        where: { id: existingSameStart.id },
        data: {
          periodEnd: parsedBody.data.periodEnd,
          flow: parsedBody.data.flow,
          symptoms: parsedBody.data.symptoms,
          notes: parsedBody.data.notes,
          ovulationDate: parsedBody.data.ovulationDate,
        },
      });
      return jsonOk(updated);
    }

    const previousCycle = await prisma.cycleTrack.findFirst({
      where: { patientId: session.user.patientId },
      orderBy: { periodStart: "desc" },
    });

    const cycleLength = previousCycle
      ? Math.round((parsedBody.data.periodStart.getTime() - previousCycle.periodStart.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const cycle = await prisma.cycleTrack.create({
      data: {
        ...parsedBody.data,
        patientId: session.user.patientId,
        cycleLength: cycleLength ?? undefined,
      },
    });

    return jsonOk(cycle, {}, 201);
  } catch (e) {
    return jsonError("Failed to create cycle entry", 500, { details: String(e) });
  }
}
