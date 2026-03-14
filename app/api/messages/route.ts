import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { conversationCreateSchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";

export async function GET() {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const where: Prisma.ConversationWhereInput =
      session.user.role === "PATIENT"
        ? { patientId: session.user.patientId ?? "" }
        : { providerId: session.user.providerId ?? "" };

    if ((session.user.role === "PATIENT" && !session.user.patientId) || (session.user.role === "PROVIDER" && !session.user.providerId)) {
      return jsonError("Profile not found", 404);
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, email: true } } } },
        provider: { include: { user: { select: { id: true, email: true } } } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            senderId: true,
            content: true,
            messageType: true,
            isRead: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    });

    const withUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            isRead: false,
            senderId: { not: session.user.id },
          },
        });

        return {
          ...conversation,
          unreadCount,
          lastMessage: conversation.messages[0] ?? null,
          messages: undefined,
        };
      }),
    );

    const totalUnread = withUnread.reduce((sum, item) => sum + item.unreadCount, 0);

    return jsonOk({ conversations: withUnread, totalUnread }, { count: withUnread.length });
  } catch (e) {
    return jsonError("Failed to fetch conversations", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = conversationCreateSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    const patientId = session.user.role === "PATIENT" ? session.user.patientId : parsedBody.data.patientId;
    const providerId = session.user.role === "PROVIDER" ? session.user.providerId : parsedBody.data.providerId;

    if (!patientId || !providerId) return jsonError("patientId and providerId are required", 422);

    const [patient, provider] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId }, select: { id: true } }),
      prisma.provider.findUnique({ where: { id: providerId }, select: { id: true } }),
    ]);

    if (!patient || !provider) return jsonError("Participant not found", 404);

    const conversation = await prisma.conversation.upsert({
      where: { patientId_providerId: { patientId, providerId } },
      create: { patientId, providerId, subject: parsedBody.data.subject },
      update: { subject: parsedBody.data.subject ?? undefined },
      include: {
        patient: { include: { user: { select: { id: true, email: true } } } },
        provider: { include: { user: { select: { id: true, email: true } } } },
      },
    });

    return jsonOk(conversation, {}, 201);
  } catch (e) {
    return jsonError("Failed to create conversation", 500, { details: String(e) });
  }
}
