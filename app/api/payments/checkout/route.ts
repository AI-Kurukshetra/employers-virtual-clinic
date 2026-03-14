import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { paymentCheckoutSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

const basePriceByType: Record<string, number> = {
  VIDEO: 120,
  AUDIO: 80,
  CHAT: 60,
  ASYNC: 45,
};

const specialtyMultiplier: Record<string, number> = {
  OBGYN: 1.3,
  THERAPY: 1.2,
  PRIMARY_CARE: 1,
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient();
    if (!stripe) return jsonError("Payments are not configured", 500, { missing: "STRIPE_SECRET_KEY" });

    const { error, session } = await requireSession(["PATIENT", "EMPLOYER_ADMIN"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = paymentCheckoutSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parsedBody.data.appointmentId },
      include: { provider: true, patient: true },
    });

    if (!appointment) return jsonError("Appointment not found", 404);
    if (session.user.role === "PATIENT" && appointment.patientId !== session.user.patientId) {
      return jsonError("Forbidden", 403);
    }

    const appointmentType = appointment.type ?? parsedBody.data.appointmentType;
    const specialty = appointment.provider.specialty ?? parsedBody.data.specialty;

    const base = basePriceByType[appointmentType] ?? 100;
    const multiplier = specialtyMultiplier[specialty.toUpperCase()] ?? 1;
    const amount = Math.round(base * multiplier * 100);

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: parsedBody.data.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        appointmentId: appointment.id,
        providerId: appointment.providerId,
        patientId: appointment.patientId,
        specialty,
        appointmentType,
      },
    });

    return jsonOk(
      {
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
        amount,
        currency: parsedBody.data.currency,
      },
      { action: "checkout" },
      201,
    );
  } catch (e) {
    return jsonError("Failed to create checkout session", 500, { details: String(e) });
  }
}
