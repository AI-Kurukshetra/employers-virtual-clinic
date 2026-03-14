import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function POST() {
  try {
    const { error, session } = await requireSession();
    if (error || !session) return error;

    const updated = await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, sentAt: new Date() },
    });

    return jsonOk(updated, { markedAllRead: true });
  } catch (e) {
    return jsonError("Failed to mark notifications as read", 500, { details: String(e) });
  }
}
