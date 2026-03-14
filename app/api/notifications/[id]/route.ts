import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function PATCH(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error, session } = await requireSession();
    if (error || !session) return error;

    const parsedParams = idParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return jsonError("Invalid notification id", 422, { issues: parsedParams.error.flatten() });
    }

    const existing = await prisma.notification.findUnique({ where: { id: parsedParams.data.id } });
    if (!existing) return jsonError("Notification not found", 404);
    if (existing.userId !== session.user.id) return jsonError("Forbidden", 403);

    const updated = await prisma.notification.update({
      where: { id: existing.id },
      data: { isRead: true, sentAt: existing.sentAt ?? new Date() },
    });

    return jsonOk(updated);
  } catch (e) {
    return jsonError("Failed to mark notification as read", 500, { details: String(e) });
  }
}
