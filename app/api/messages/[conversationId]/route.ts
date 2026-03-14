import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { jsonError, jsonOk } from "@/lib/utils";

async function getAuthorizedConversation(conversationId: string, user: { role: string; patientId?: string | null; providerId?: string | null }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      patient: { include: { user: { select: { id: true } } } },
      provider: { include: { user: { select: { id: true } } } },
    },
  });

  if (!conversation) {
    return { conversation: null, error: jsonError("Conversation not found", 404) };
  }

  const allowed =
    (user.role === "PATIENT" && user.patientId === conversation.patientId) ||
    (user.role === "PROVIDER" && user.providerId === conversation.providerId);

  if (!allowed) {
    return { conversation: null, error: jsonError("Forbidden", 403) };
  }

  return { conversation, error: null };
}

function parseStoredContent(stored: string) {
  try {
    const parsed = JSON.parse(stored) as { encryptedContent: string; iv: string };
    if (parsed?.encryptedContent && parsed?.iv) return parsed;
    return { encryptedContent: stored, iv: "" };
  } catch {
    return { encryptedContent: stored, iv: "" };
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const { conversationId } = await context.params;
    if (!conversationId) return jsonError("Invalid conversationId", 422);

    const { conversation, error: conversationError } = await getAuthorizedConversation(conversationId, session.user);
    if (conversationError || !conversation) return conversationError;

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const take = 50;
    const skip = (safePage - 1) * take;

    const fetched = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        messageType: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    const fetchedIds = fetched.map((m) => m.id);
    if (fetchedIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: fetchedIds },
          senderId: { not: session.user.id },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    const refreshed = await prisma.message.findMany({
      where: { id: { in: fetchedIds } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        messageType: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    const messages = refreshed.map((message) => {
      const parsed = parseStoredContent(message.content);
      return {
        ...message,
        content: parsed.encryptedContent,
        iv: parsed.iv,
      };
    });

    return jsonOk(messages, { page: safePage, take, skip, count: messages.length });
  } catch (e) {
    return jsonError("Failed to fetch messages", 500, { details: String(e) });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const { conversationId } = await context.params;
    if (!conversationId) return jsonError("Invalid conversationId", 422);

    const { conversation, error: conversationError } = await getAuthorizedConversation(conversationId, session.user);
    if (conversationError || !conversation) return conversationError;

    const body = (await req.json().catch(() => ({}))) as { content?: string };
    if (!body?.content || !body.content.trim()) {
      return jsonError("content is required", 422);
    }

    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) return jsonError("ENCRYPTION_KEY is not configured", 500);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(keyHex, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(body.content, "utf8"), cipher.final()]).toString("hex");

    const storedPayload = JSON.stringify({ encryptedContent: encrypted, iv: iv.toString("hex") });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: storedPayload,
        messageType: "TEXT",
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        messageType: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    const recipientUserId =
      conversation.patient.userId === session.user.id
        ? conversation.provider.userId
        : conversation.patient.userId;

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: "MESSAGE_RECEIVED",
        title: "New message",
        body: "You received a new secure message.",
        metadata: {
          conversationId: conversation.id,
          messageId: message.id,
        },
        sentAt: new Date(),
      },
    });

    const parsed = parseStoredContent(message.content);

    return jsonOk(
      {
        ...message,
        content: parsed.encryptedContent,
        iv: parsed.iv,
      },
      {},
      201,
    );
  } catch (e) {
    return jsonError("Failed to send message", 500, { details: String(e) });
  }
}
