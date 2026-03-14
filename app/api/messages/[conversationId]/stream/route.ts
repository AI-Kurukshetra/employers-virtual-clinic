import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { jsonError } from "@/lib/utils";

function parseStoredContent(stored: string) {
  try {
    const parsed = JSON.parse(stored) as { encryptedContent: string; iv: string };
    if (parsed?.encryptedContent && parsed?.iv) return parsed;
    return { encryptedContent: stored, iv: "" };
  } catch {
    return { encryptedContent: stored, iv: "" };
  }
}

async function getAuthorizedConversation(conversationId: string, user: { role: string; patientId?: string | null; providerId?: string | null }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, patientId: true, providerId: true },
  });

  if (!conversation) return { conversation: null, error: jsonError("Conversation not found", 404) };

  const allowed =
    (user.role === "PATIENT" && user.patientId === conversation.patientId) ||
    (user.role === "PROVIDER" && user.providerId === conversation.providerId);

  if (!allowed) return { conversation: null, error: jsonError("Forbidden", 403) };

  return { conversation, error: null };
}

export const runtime = "nodejs";

export async function GET(req: Request, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { error, session } = await requireSession(["PATIENT", "PROVIDER"]);
    if (error || !session) return error;

    const { conversationId } = await context.params;
    if (!conversationId) return jsonError("Invalid conversationId", 422);

    const { conversation, error: conversationError } = await getAuthorizedConversation(conversationId, session.user);
    if (conversationError || !conversation) return conversationError;

    const url = new URL(req.url);
    const lastId = url.searchParams.get("lastId");

    let lastCreatedAt = new Date(0);
    if (lastId) {
      const lastMsg = await prisma.message.findUnique({ where: { id: lastId }, select: { createdAt: true } });
      if (lastMsg?.createdAt) lastCreatedAt = lastMsg.createdAt;
    }

    const encoder = new TextEncoder();

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));

        pollTimer = setInterval(async () => {
          try {
            const messages = await prisma.message.findMany({
              where: {
                conversationId: conversation.id,
                createdAt: { gt: lastCreatedAt },
              },
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

            if (messages.length > 0) {
              lastCreatedAt = messages[messages.length - 1].createdAt;
              const transformed = messages.map((message) => {
                const parsed = parseStoredContent(message.content);
                return {
                  ...message,
                  content: parsed.encryptedContent,
                  iv: parsed.iv,
                };
              });
              send(`data: ${JSON.stringify(transformed)}\n\n`);
            }
          } catch (pollError) {
            send(`data: ${JSON.stringify({ error: String(pollError) })}\n\n`);
          }
        }, 2000);

        pingTimer = setInterval(() => {
          send(`: ping\n\n`);
        }, 15000);

        const cleanup = () => {
          if (pollTimer) clearInterval(pollTimer);
          if (pingTimer) clearInterval(pingTimer);
          try {
            controller.close();
          } catch {
            // no-op
          }
        };

        req.signal.addEventListener("abort", cleanup);
      },
      cancel() {
        if (pollTimer) clearInterval(pollTimer);
        if (pingTimer) clearInterval(pingTimer);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return jsonError("Failed to stream messages", 500, { details: String(e) });
  }
}
