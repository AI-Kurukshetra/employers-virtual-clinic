import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { carePlanMilestonePatchSchema, idParamSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid care plan id", 422, { issues: parsedParams.error.flatten() });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = carePlanMilestonePatchSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const current = await prisma.carePlan.findUnique({ where: { id: parsedParams.data.id }, select: { providerId: true, milestones: true } });
    if (!current) return jsonError("Care plan not found", 404);
    if (current.providerId !== session.user.providerId) return jsonError("Forbidden", 403);

    const milestones = ((current.milestones as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    milestones[parsedBody.data.milestoneKey] = {
      completed: parsedBody.data.completed,
      completedAt: parsedBody.data.completed ? new Date().toISOString() : null,
    };

    const updated = await prisma.carePlan.update({
      where: { id: parsedParams.data.id },
      data: { milestones: milestones as Prisma.InputJsonValue },
    });

    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to update milestone", 500, { details: String(e) });
  }
}
