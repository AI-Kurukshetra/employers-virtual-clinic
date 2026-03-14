import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { symptomFiltersSchema, symptomSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT"]);
    if (error || !session) return error;

    if (!session.user.patientId) return jsonError("Patient profile not found", 404);

    const parsedQuery = symptomFiltersSchema.safeParse({
      fromDate: req.nextUrl.searchParams.get("fromDate") ?? undefined,
      toDate: req.nextUrl.searchParams.get("toDate") ?? undefined,
    });

    if (!parsedQuery.success) {
      return jsonError("Invalid query params", 422, { issues: parsedQuery.error.flatten() });
    }

    const logs = await prisma.symptomLog.findMany({
      where: {
        patientId: session.user.patientId,
        date: {
          gte: parsedQuery.data.fromDate,
          lte: parsedQuery.data.toDate,
        },
      },
      orderBy: { date: "desc" },
    });

    return jsonOk(logs, { count: logs.length });
  } catch (e) {
    return jsonError("Failed to fetch symptom logs", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT"]);
    if (error || !session) return error;

    if (!session.user.patientId) return jsonError("Patient profile not found", 404);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = symptomSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const log = await prisma.symptomLog.create({
      data: {
        ...parsedBody.data,
        patientId: session.user.patientId,
        symptoms: parsedBody.data.symptoms as Prisma.InputJsonValue,
      },
    });

    return jsonOk(log, {}, 201);
  } catch (e) {
    return jsonError("Failed to create symptom log", 500, { details: String(e) });
  }
}
