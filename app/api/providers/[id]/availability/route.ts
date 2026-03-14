import { NextRequest } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { idParamSchema, providerAvailabilityFiltersSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

type WeeklyAvailability = Record<string, Array<{ start: string; end: string }>>;

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function getSlots(availability: WeeklyAvailability, fromDate: Date, toDate: Date, slotMinutes = 30) {
  const slots: Date[] = [];
  const current = new Date(fromDate);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(toDate);
  endDate.setHours(23, 59, 59, 999);

  while (current <= endDate) {
    const dayKey = current.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase();
    const windows = availability[dayKey] ?? [];

    for (const window of windows) {
      const start = parseTime(window.start);
      const end = parseTime(window.end);
      if (!start || !end) continue;

      const windowStart = new Date(current);
      windowStart.setHours(start.hour, start.minute, 0, 0);

      const windowEnd = new Date(current);
      windowEnd.setHours(end.hour, end.minute, 0, 0);

      let cursor = windowStart;
      while (addMinutes(cursor, slotMinutes) <= windowEnd) {
        slots.push(new Date(cursor));
        cursor = addMinutes(cursor, slotMinutes);
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid provider id", 422, { issues: parsedParams.error.flatten() });
    }

    const parsedQuery = providerAvailabilityFiltersSchema.safeParse({
      fromDate: req.nextUrl.searchParams.get("fromDate") ?? undefined,
      toDate: req.nextUrl.searchParams.get("toDate") ?? undefined,
    });

    if (!parsedQuery.success) {
      return jsonError("Invalid query params", 422, { issues: parsedQuery.error.flatten() });
    }

    const { fromDate, toDate } = parsedQuery.data;
    if (fromDate > toDate) return jsonError("fromDate must be before toDate", 422);

    const provider = await prisma.provider.findUnique({
      where: { id: parsedParams.data.id },
      select: { id: true, availability: true },
    });
    if (!provider) return jsonError("Provider not found", 404);

    const availability = provider.availability as WeeklyAvailability;
    const potentialSlots = getSlots(availability, fromDate, toDate);

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
        scheduledAt: { gte: fromDate, lte: toDate },
      },
      select: { scheduledAt: true, duration: true },
    });

    const availableSlots = potentialSlots.filter((slot) => {
      const slotEnd = addMinutes(slot, 30);
      return !appointments.some((appt) => {
        const apptStart = appt.scheduledAt;
        const apptEnd = addMinutes(apptStart, appt.duration);
        return overlaps(slot, slotEnd, apptStart, apptEnd);
      });
    });

    return jsonOk(
      { providerId: provider.id, fromDate, toDate, availableSlots },
      { count: availableSlots.length },
    );
  } catch (e) {
    return jsonError("Failed to fetch provider availability", 500, { details: String(e) });
  }
}
