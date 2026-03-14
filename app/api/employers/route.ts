import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { employerSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["EMPLOYER_ADMIN"]);
    if (error || !session) return error;

    const admin = await prisma.employerAdmin.findUnique({
      where: { userId: session.user.id },
      include: {
        employer: {
          include: {
            insuranceClaims: true,
          },
        },
      },
    });

    if (!admin) return jsonError("Employer admin profile not found", 404);

    const utilization = {
      totalClaims: admin.employer.insuranceClaims.length,
      approvedClaims: admin.employer.insuranceClaims.filter((c: (typeof admin.employer.insuranceClaims)[number]) => c.status === "APPROVED").length,
      totalPaid: admin.employer.insuranceClaims.reduce(
        (sum: number, c: (typeof admin.employer.insuranceClaims)[number]) => sum + c.paidAmount,
        0,
      ),
    };

    return jsonOk({ employer: admin.employer, utilization });
  } catch (e) {
    return jsonError("Failed to fetch employer details", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireSession(["SUPER_ADMIN"]);
    if (error) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = employerSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 422, { issues: parsed.error.flatten() });

    const employer = await prisma.employer.create({
      data: {
        ...parsed.data,
        ssoConfig: parsed.data.ssoConfig as Prisma.InputJsonValue | undefined,
      },
    });
    return jsonOk(employer, {}, 201);
  } catch (e) {
    return jsonError("Failed to create employer", 500, { details: String(e) });
  }
}
