import { NextRequest } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

const metadataSchema = z.object({
  appointmentId: z.string().min(1),
  providerId: z.string().min(1),
  patientId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature") ?? "";
    const payload = await req.text();

    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadataParsed = metadataSchema.safeParse(paymentIntent.metadata);

      if (!metadataParsed.success) {
        return jsonError("Invalid payment metadata", 422, { issues: metadataParsed.error.flatten() });
      }

      const { appointmentId, providerId, patientId } = metadataParsed.data;

      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
      });

      await prisma.insuranceClaim.create({
        data: {
          appointmentId: appointment.id,
          providerId,
          patientId,
          claimNumber: `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          serviceDate: appointment.scheduledAt,
          diagnosisCodes: ["Z00.00"],
          procedureCodes: ["99457"],
          billedAmount: Number(paymentIntent.amount) / 100,
          allowedAmount: Number(paymentIntent.amount) / 100,
          paidAmount: 0,
          status: "SUBMITTED",
        },
      });
    }

    return jsonOk({ received: true, eventType: event.type });
  } catch (e) {
    return jsonError("Failed to process webhook", 500, { details: String(e) });
  }
}
