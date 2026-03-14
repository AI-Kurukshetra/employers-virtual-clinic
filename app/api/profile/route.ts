import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { jsonError, jsonOk } from "@/lib/utils";

export async function GET() {
  try {
    const { error, session } = await requireSession();
    if (error || !session) return error;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patient: true,
        provider: true,
        employerAdmin: { include: { employer: true } },
      },
    });

    if (!user) return jsonError("User not found", 404);
    return jsonOk(user);
  } catch (e) {
    return jsonError("Failed to fetch profile", 500, { details: String(e) });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error, session } = await requireSession();
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (session.user.role === "PATIENT" && session.user.patientId) {
      const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber : undefined;
      const insuranceProvider = typeof body.insuranceProvider === "string" ? body.insuranceProvider : undefined;
      const insuranceId = typeof body.insuranceId === "string" ? body.insuranceId : undefined;

      const patient = await prisma.patient.update({
        where: { id: session.user.patientId },
        data: {
          ...(phoneNumber !== undefined ? { phoneNumber } : {}),
          ...(insuranceProvider !== undefined ? { insuranceProvider } : {}),
          ...(insuranceId !== undefined ? { insuranceId } : {}),
        },
      });

      return jsonOk(patient);
    }

    if (session.user.role === "PROVIDER" && session.user.providerId) {
      const bio = typeof body.bio === "string" ? body.bio : undefined;
      const specialty = typeof body.specialty === "string" ? body.specialty : undefined;
      const languages = Array.isArray(body.languages) ? body.languages.filter((v): v is string => typeof v === "string") : undefined;

      const provider = await prisma.provider.update({
        where: { id: session.user.providerId },
        data: {
          ...(bio !== undefined ? { bio } : {}),
          ...(specialty !== undefined ? { specialty } : {}),
          ...(languages !== undefined ? { languages } : {}),
        },
      });

      return jsonOk(provider);
    }

    return jsonError("No editable profile fields for this role", 400);
  } catch (e) {
    return jsonError("Failed to update profile", 500, { details: String(e) });
  }
}
