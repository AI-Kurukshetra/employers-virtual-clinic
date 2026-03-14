"use client";

import crypto from "crypto";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Video } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionUser } from "@/hooks/use-session-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type ConversationItem = {
  id: string;
  subject: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastMessage: { id: string; content: string; createdAt: string } | null;
  provider: { specialty?: string | null; user?: { email?: string | null } };
};

type ConversationsResponse = {
  conversations: ConversationItem[];
  totalUnread: number;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  iv: string;
  isRead: boolean;
  createdAt: string;
};

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function postToApi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

function parseStoredPayload(content: string, iv?: string) {
  if (iv) return { encryptedContent: content, iv };

  try {
    const parsed = JSON.parse(content) as { encryptedContent?: string; iv?: string };
    if (parsed.encryptedContent && parsed.iv) {
      return { encryptedContent: parsed.encryptedContent, iv: parsed.iv };
    }
  } catch {
    // no-op
  }

  return { encryptedContent: content, iv: "" };
}

function decryptMessageContent(content: string, iv?: string) {
  try {
    const payload = parseStoredPayload(content, iv);
    if (!payload.iv) return "[Encrypted message]";

    const keyHex = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!keyHex) return "[Missing decryption key]";

    const key = Buffer.from(keyHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(payload.iv, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encryptedContent, "hex")),
      decipher.final(),
    ]).toString("utf8");

    return decrypted;
  } catch {
    return "[Unable to decrypt]";
  }
}

function providerName(item?: ConversationItem) {
  const email = item?.provider?.user?.email ?? "provider@maven.health";
  return email.split("@")[0].replace(/[._-]/g, " ");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function truncate(text: string, length = 40) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

export default function PatientMessagesPage() {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [draft, setDraft] = useState("");

  const conversationsQuery = useQuery({
    queryKey: ["messages-conversations"],
    queryFn: () => fetchFromApi<ConversationsResponse>("/api/messages"),
    refetchInterval: 15000,
  });

  const messagesQuery = useQuery({
    queryKey: ["conversation-messages", selectedConversationId],
    enabled: Boolean(selectedConversationId),
    queryFn: () => fetchFromApi<Message[]>(`/api/messages/${selectedConversationId}?page=1`),
  });

  useEffect(() => {
    if (!selectedConversationId) {
      const first = conversationsQuery.data?.conversations?.[0]?.id;
      if (first) setSelectedConversationId(first);
    }
  }, [conversationsQuery.data?.conversations, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const existing = messagesQuery.data ?? [];
    const lastId = existing.length ? existing[existing.length - 1].id : "";
    const es = new EventSource(`/api/messages/${selectedConversationId}/stream?lastId=${lastId}`);

    es.onmessage = (event) => {
      if (!event.data) return;

      const incoming = JSON.parse(event.data) as Message[];
      queryClient.setQueryData<Message[]>(["conversation-messages", selectedConversationId], (current = []) => {
        const seen = new Set(current.map((m) => m.id));
        const merged = [...current, ...incoming.filter((m) => !seen.has(m.id))];
        return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    };

    return () => {
      es.close();
    };
  }, [queryClient, selectedConversationId, messagesQuery.data]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return postToApi<Message>(`/api/messages/${selectedConversationId}`, { content });
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["conversation-messages", selectedConversationId] });

      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId: selectedConversationId,
        senderId: user?.id ?? "me",
        content,
        iv: "",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["conversation-messages", selectedConversationId], (current = []) => [...current, optimistic]);

      return { optimisticId: optimistic.id };
    },
    onSuccess: async () => {
      setDraft("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversationId] }),
        queryClient.invalidateQueries({ queryKey: ["messages-conversations"] }),
      ]);
    },
    onError: async (_error, _variables, context) => {
      if (context?.optimisticId) {
        queryClient.setQueryData<Message[]>(["conversation-messages", selectedConversationId], (current = []) =>
          current.filter((m) => m.id !== context.optimisticId),
        );
      }
    },
  });

  const conversations = conversationsQuery.data?.conversations ?? [];
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const decryptedMessages = useMemo(
    () => (messagesQuery.data ?? []).map((m) => ({ ...m, plaintext: decryptMessageContent(m.content, m.iv) })),
    [messagesQuery.data],
  );

  const lastSentMessageId = [...decryptedMessages]
    .reverse()
    .find((m) => m.senderId === user?.id)?.id;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff0f5_0%,#effbf8_45%,#f6fbff_100%)] p-4">
      <div className="mx-auto grid h-[92vh] w-full max-w-7xl gap-4 lg:grid-cols-[340px,1fr]">
        <Card className="overflow-hidden bg-white/90">
          <div className="border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Messages</h1>
          </div>
          <div className="h-[calc(92vh-56px)] space-y-1 overflow-y-auto p-2">
            {conversations.map((conversation) => {
              const name = providerName(conversation);
              const preview = conversation.lastMessage
                ? truncate(decryptMessageContent(conversation.lastMessage.content))
                : "No messages yet";
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full rounded-xl p-3 text-left transition ${selectedConversationId === conversation.id ? "bg-teal-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {initials(name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <span className="text-[11px] text-muted-foreground">
                          {conversation.lastMessageAt
                            ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                            : ""}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{preview}</p>
                    </div>
                    {conversation.unreadCount > 0 ? <Badge>{conversation.unreadCount}</Badge> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex h-[92vh] flex-col overflow-hidden bg-white/95">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-semibold">{selectedConversation ? providerName(selectedConversation) : "Select conversation"}</p>
              <p className="text-xs text-muted-foreground">{selectedConversation?.provider?.specialty ?? "Care Provider"}</p>
            </div>
            <Button variant="outline" size="sm">
              <Video className="mr-1 h-4 w-4" />
              Video Call
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {decryptedMessages.map((message) => {
              const mine = message.senderId === user?.id;
              const showRead = mine && message.id === lastSentMessageId && message.isRead;

              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[78%]">
                    <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-900"}`}>
                      {message.plaintext}
                    </div>
                    <div className={`mt-1 text-[11px] text-muted-foreground ${mine ? "text-right" : "text-left"}`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </div>
                    {showRead ? <div className="text-right text-[11px] text-sky-600">Read</div> : null}
                  </div>
                </div>
              );
            })}
          </div>

          <form
            className="border-t p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim() || !selectedConversationId || sendMutation.isPending) return;
              sendMutation.mutate(draft);
            }}
          >
            <div className="flex gap-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a secure message"
                className="min-h-[44px]"
              />
              <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-500" disabled={!selectedConversationId || sendMutation.isPending}>
                Send
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
