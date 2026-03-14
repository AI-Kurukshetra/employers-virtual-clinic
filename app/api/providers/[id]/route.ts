import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { idParamSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";

const availabilityPatchSchema = z.object({
  availability: z.record(z.string(), z.unknown()),
  acceptingPatients: z.boolean().optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireSession(["PROVIDER", "SUPER_ADMIN"]);
    if (error) return error;

    const parsed = idParamSchema.safeParse(await context.params);
    if (!parsed.success) return jsonError("Invalid provider id", 422, { issues: parsed.error.flatten() });

    const provider = await prisma.provider.findUnique({
      where: { id: parsed.data.id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!provider) return jsonError("Provider not found", 404);

    return jsonOk(provider);
  } catch (e) {
    return jsonError("Failed to fetch provider", 500, { details: String(e) });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    const parsed = idParamSchema.safeParse(await context.params);
    if (!parsed.success) return jsonError("Invalid provider id", 422, { issues: parsed.error.flatten() });

    if (session.user.providerId !== parsed.data.id) return jsonError("Forbidden", 403);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = availabilityPatchSchema.safeParse(body);
    if (!parsedBody.success) return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });

    const updated = await prisma.provider.update({
      where: { id: parsed.data.id },
      data: {
        availability: parsedBody.data.availability as Prisma.InputJsonValue,
        acceptingPatients: parsedBody.data.acceptingPatients,
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to update provider", 500, { details: String(e) });
  }
}
