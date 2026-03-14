import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { providerFiltersSchema, providerSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

function isProviderAvailableOn(availability: unknown, date: Date) {
  if (!availability || typeof availability !== "object") return false;

  const weekday = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase();
  const raw = (availability as Record<string, unknown>)[weekday];
  return Array.isArray(raw) && raw.length > 0;
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const parsedQuery = providerFiltersSchema.safeParse({
      specialty: req.nextUrl.searchParams.get("specialty") ?? undefined,
      language: req.nextUrl.searchParams.get("language") ?? undefined,
      availableOn: req.nextUrl.searchParams.get("availableOn") ?? undefined,
      acceptingPatients: req.nextUrl.searchParams.get("acceptingPatients") ?? undefined,
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });

    if (!parsedQuery.success) {
      return jsonError("Invalid query params", 422, { issues: parsedQuery.error.flatten() });
    }

    const { specialty, language, availableOn, acceptingPatients, page, limit } = parsedQuery.data;

    const where: Prisma.ProviderWhereInput = {};
    if (specialty) where.specialty = specialty;
    if (language) where.languages = { has: language };
    if (typeof acceptingPatients === "boolean") where.acceptingPatients = acceptingPatients;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: { user: { select: { id: true, email: true, role: true } } },
        orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    const filtered = availableOn ? providers.filter((p) => isProviderAvailableOn(p.availability, availableOn)) : providers;

    return jsonOk(filtered, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: filtered.length,
    });
  } catch (e) {
    return jsonError("Failed to fetch providers", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PROVIDER"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = providerSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const existing = await prisma.provider.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (existing) return jsonError("Provider profile already exists", 409);

    const provider = await prisma.provider.create({
      data: {
        ...parsedBody.data,
        userId: session.user.id,
        availability: parsedBody.data.availability as Prisma.InputJsonValue,
      },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    return jsonOk(provider, {}, 201);
  } catch (e) {
    return jsonError("Failed to create provider profile", 500, { details: String(e) });
  }
}
