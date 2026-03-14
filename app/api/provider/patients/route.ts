import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { jsonError, jsonOk } from "@/lib/utils";

const querySchema = z.object({
  q: z.string().optional(),
  condition: z.string().optional(),
  carePlanStatus: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
  lastVisitFrom: z.coerce.date().optional(),
  lastVisitTo: z.coerce.date().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const parsed = querySchema.safeParse({
      q: req.nextUrl.searchParams.get("q") ?? undefined,
      condition: req.nextUrl.searchParams.get("condition") ?? undefined,
      carePlanStatus: req.nextUrl.searchParams.get("carePlanStatus") ?? undefined,
      lastVisitFrom: req.nextUrl.searchParams.get("lastVisitFrom") ?? undefined,
      lastVisitTo: req.nextUrl.searchParams.get("lastVisitTo") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError("Invalid query params", 422, { issues: parsed.error.flatten() });
    }

    const { q, condition, carePlanStatus, lastVisitFrom, lastVisitTo } = parsed.data;

    const appointments = await prisma.appointment.findMany({
      where: { providerId: session.user.providerId },
      include: {
        patient: {
          include: {
            user: { select: { id: true, email: true } },
            carePlans: {
              where: { providerId: session.user.providerId },
              select: { id: true, condition: true, status: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const byPatient = new Map<string, (typeof appointments)[number]>();
    for (const appt of appointments) {
      if (!byPatient.has(appt.patientId)) {
        byPatient.set(appt.patientId, appt);
      }
    }

    const rows = Array.from(byPatient.values()).map((appt) => {
      const patient = appt.patient;
      const latestPlan = patient.carePlans[0];
      const age = Math.max(
        0,
        Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      );
      return {
        id: patient.id,
        userId: patient.userId,
        email: patient.user.email,
        name: patient.user.email.split("@")[0].replace(/[._-]/g, " "),
        age,
        lastVisit: appt.scheduledAt,
        activeConditions: [...new Set(patient.carePlans.map((cp) => cp.condition))],
        carePlanStatus: latestPlan?.status ?? "NONE",
        carePlanCondition: latestPlan?.condition ?? null,
      };
    });

    const filtered = rows.filter((row) => {
      if (q) {
        const needle = q.toLowerCase();
        const matchesQ =
          row.name.toLowerCase().includes(needle) ||
          row.email.toLowerCase().includes(needle) ||
          row.activeConditions.some((c) => c.toLowerCase().includes(needle));
        if (!matchesQ) return false;
      }

      if (condition && !row.activeConditions.some((c) => c.toLowerCase().includes(condition.toLowerCase()))) {
        return false;
      }

      if (carePlanStatus && row.carePlanStatus !== carePlanStatus) {
        return false;
      }

      if (lastVisitFrom && new Date(row.lastVisit) < lastVisitFrom) return false;
      if (lastVisitTo && new Date(row.lastVisit) > lastVisitTo) return false;

      return true;
    });

    return jsonOk(filtered, { count: filtered.length });
  } catch (e) {
    return jsonError("Failed to fetch provider patients", 500, { details: String(e) });
  }
}
