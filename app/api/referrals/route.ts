import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { referralSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const where: Prisma.ReferralWhereInput =
      session.user.role === "PATIENT"
        ? { patientId: session.user.patientId ?? "" }
        : { referringProviderId: session.user.providerId ?? "" };

    if ((session.user.role === "PATIENT" && !session.user.patientId) || (session.user.role === "PROVIDER" && !session.user.providerId)) {
      return jsonError("Profile not found", 404);
    }

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, email: true, role: true } } } },
        referringProvider: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(referrals, { count: referrals.length });
  } catch (e) {
    return jsonError("Failed to fetch referrals", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    if (!session.user.providerId) return jsonError("Provider profile not found", 404);

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = referralSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const patient = await prisma.patient.findUnique({ where: { id: parsedBody.data.patientId }, select: { id: true } });
    if (!patient) return jsonError("Patient not found", 404);

    const referral = await prisma.referral.create({
      data: {
        ...parsedBody.data,
        referringProviderId: session.user.providerId,
      },
    });

    return jsonOk(referral, {}, 201);
  } catch (e) {
    return jsonError("Failed to create referral", 500, { details: String(e) });
  }
}
