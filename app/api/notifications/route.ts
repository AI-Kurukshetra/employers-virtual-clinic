import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error, session } = await requireSession();
    if (error || !session) return error;

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    });

    return jsonOk(notifications, { count: notifications.length });
  } catch (e) {
    return jsonError("Failed to fetch notifications", 500, { details: String(e) });
  }
}
