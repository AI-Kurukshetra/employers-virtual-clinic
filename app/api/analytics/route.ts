import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession(["EMPLOYER_ADMIN", "PROVIDER", "SUPER_ADMIN"]);
    if (error || !session) return error;

    if (session.user.role === "EMPLOYER_ADMIN") {
      const admin = await prisma.employerAdmin.findUnique({
        where: { userId: session.user.id },
        include: { employer: true },
      });
      if (!admin) return jsonError("Employer admin profile not found", 404);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const claims = await prisma.insuranceClaim.findMany({ where: { employerId: admin.employerId } });
      const appointmentsThisMonth = claims.filter((c) => c.serviceDate >= monthStart).length;
      const activeUsers = new Set(claims.map((c) => c.patientId)).size;

      const providerIds = [...new Set(claims.map((c) => c.providerId))];
      const providers = providerIds.length
        ? await prisma.provider.findMany({ where: { id: { in: providerIds } }, select: { id: true, specialty: true } })
        : [];

      const specialtyCounts = providers.reduce<Record<string, number>>((acc, provider) => {
        acc[provider.specialty] = (acc[provider.specialty] ?? 0) + claims.filter((c) => c.providerId === provider.id).length;
        return acc;
      }, {});

      const topSpecialties = Object.entries(specialtyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([specialty, count]) => ({ specialty, count }));

      return jsonOk({
        totalEmployees: admin.employer.employeeCount,
        activeUsers,
        appointmentsThisMonth,
        topSpecialties,
        avgSatisfactionScore: 4.4,
        costSavings: claims.reduce((sum, c) => sum + (c.billedAmount - c.allowedAmount), 0),
      });
    }

    if (session.user.role === "PROVIDER") {
      if (!session.user.providerId) return jsonError("Provider profile not found", 404);

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const [todayAppointments, totalPatientsGrouped, pendingPrescriptions, completedAppointments, allAppointments] =
        await Promise.all([
          prisma.appointment.count({
            where: {
              providerId: session.user.providerId,
              scheduledAt: { gte: start, lte: end },
            },
          }),
          prisma.appointment.groupBy({ by: ["patientId"], where: { providerId: session.user.providerId } }),
          prisma.prescription.count({ where: { providerId: session.user.providerId, status: "ACTIVE" } }),
          prisma.appointment.count({ where: { providerId: session.user.providerId, status: "COMPLETED" } }),
          prisma.appointment.count({ where: { providerId: session.user.providerId } }),
        ]);

      return jsonOk({
        todayAppointments,
        totalPatients: totalPatientsGrouped.length,
        pendingPrescriptions,
        completionRate: allAppointments > 0 ? completedAppointments / allAppointments : 0,
      });
    }

    const [totalPatients, totalProviders, totalAppointments] = await Promise.all([
      prisma.patient.count(),
      prisma.provider.count(),
      prisma.appointment.count(),
    ]);

    return jsonOk({
      totalPatients,
      totalProviders,
      totalAppointments,
      mrr: 0,
      churnRate: 0,
    });
  } catch (e) {
    return jsonError("Failed to load analytics", 500, { details: String(e) });
  }
}
