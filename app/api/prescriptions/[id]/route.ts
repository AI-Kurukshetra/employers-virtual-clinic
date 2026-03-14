import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { idParamSchema, prescriptionPatchSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid prescription id", 422, { issues: parsedParams.error.flatten() });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = prescriptionPatchSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const prescription = await prisma.prescription.findUnique({ where: { id: parsedParams.data.id } });
    if (!prescription) return jsonError("Prescription not found", 404);
    if (prescription.providerId !== session.user.providerId) return jsonError("Forbidden", 403);

    if (parsedBody.data.refillRequested && prescription.refillsRemaining <= 0) {
      return jsonError("No refills remaining", 409);
    }

    const updated = await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        status: parsedBody.data.status,
        refillsRemaining: parsedBody.data.refillRequested ? { decrement: 1 } : undefined,
      },
    });

    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to update prescription", 500, { details: String(e) });
  }
}
