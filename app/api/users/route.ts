import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, userRegistrationSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["SUPER_ADMIN"]);
    if (error) return error;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
        provider: true,
        employerAdmin: true,
      },
    });

    return jsonOk(users, { count: users.length, userId: session?.user.id });
  } catch (e) {
    return jsonError("Failed to fetch users", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const detailed = userRegistrationSchema.safeParse(body);
    const basic = registerSchema.safeParse(body);

    if (!detailed.success && !basic.success) {
      return jsonError("Invalid input", 422, {
        issues: {
          detailed: detailed.error?.flatten(),
          basic: basic.error?.flatten(),
        },
      });
    }

    const role = detailed.success ? detailed.data.role : basic.success ? basic.data.role : null;
    const email = detailed.success ? detailed.data.email : basic.success ? basic.data.email : null;
    const password = detailed.success ? detailed.data.password : basic.success ? basic.data.password : null;

    if (!role || !email || !password) {
      return jsonError("Invalid input", 422);
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return jsonError("Email already registered", 409);

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        patient:
          detailed.success && detailed.data.role === "PATIENT" && detailed.data.patientDetails
            ? {
                create: {
                  dateOfBirth: detailed.data.patientDetails.dateOfBirth,
                  phoneNumber: detailed.data.patientDetails.phoneNumber,
                  address: { line1: detailed.data.patientDetails.address },
                  emergencyContact: { name: detailed.data.name, phone: detailed.data.patientDetails.phoneNumber },
                  insuranceProvider: detailed.data.patientDetails.insuranceProvider,
                  insuranceId: detailed.data.patientDetails.insuranceId,
                  allergies: [],
                  medications: [],
                },
              }
            : undefined,
        provider:
          detailed.success && detailed.data.role === "PROVIDER" && detailed.data.providerDetails
            ? {
                create: {
                  specialty: detailed.data.providerDetails.specialty,
                  licenseNumber: detailed.data.providerDetails.licenseNumber,
                  licenseState: detailed.data.providerDetails.licenseState,
                  npiNumber: detailed.data.providerDetails.npiNumber,
                  languages: detailed.data.providerDetails.languages,
                  bio: detailed.data.providerDetails.bio,
                  availability: {
                    monday: [{ start: "09:00", end: "17:00" }],
                    tuesday: [{ start: "09:00", end: "17:00" }],
                    wednesday: [{ start: "09:00", end: "17:00" }],
                    thursday: [{ start: "09:00", end: "17:00" }],
                    friday: [{ start: "09:00", end: "13:00" }],
                  },
                },
              }
            : undefined,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return jsonOk(user, {}, 201);
  } catch (e) {
    return jsonError("Failed to create user", 500, { details: String(e) });
  }
}
