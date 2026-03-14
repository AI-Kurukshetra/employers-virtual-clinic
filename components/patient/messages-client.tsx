"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { decryptClientMessage } from "@/lib/crypto-client";
import { useSessionUser } from "@/hooks/use-session-user";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type ConversationListItem = {
  id: string;
  subject: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  patient: { user?: { email?: string } };
  provider: { user?: { email?: string } };
};

type ConversationListResponse = {
  conversations: ConversationListItem[];
  totalUnread: number;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
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

function displayName(email?: string) {
  if (!email) return "Care Team";
  return email.split("@")[0].replace(/[._-]/g, " ");
}

async function decryptOrFallback(encrypted: string) {
  try {
    return await decryptClientMessage(encrypted);
  } catch {
    return "[Unable to decrypt message]";
  }
}

export function PatientMessagesClient() {
  const queryClient = useQueryClient();
  const { user } = useSessionUser();
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetchFromApi<ConversationListResponse>("/api/messages"),
    refetchInterval: 10_000,
  });

  const messagesQuery = useQuery({
    queryKey: ["conversationMessages", selectedConversationId],
    enabled: Boolean(selectedConversationId),
    queryFn: () => fetchFromApi<Message[]>(`/api/messages/${selectedConversationId}?page=1&limit=50`),
  });

  useEffect(() => {
    if (!selectedConversationId) {
      const firstId = conversationsQuery.data?.conversations[0]?.id;
      if (firstId) setSelectedConversationId(firstId);
    }
  }, [conversationsQuery.data?.conversations, selectedConversationId]);

  useEffect(() => {
    const eventSource = selectedConversationId ? new EventSource(`/api/messages/${selectedConversationId}/stream`) : null;

    if (!eventSource) return;

    eventSource.addEventListener("messages", (event) => {
      const parsed = JSON.parse((event as MessageEvent).data) as Message[];

      queryClient.setQueryData<Message[]>(["conversationMessages", selectedConversationId], (existing = []) => {
        const existingIds = new Set(existing.map((msg) => msg.id));
        const merged = [...existing, ...parsed.filter((msg) => !existingIds.has(msg.id))];
        return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    });

    return () => {
      eventSource.close();
    };
  }, [queryClient, selectedConversationId]);

  useEffect(() => {
    const load = async () => {
      const entries = await Promise.all(
        (messagesQuery.data ?? []).map(async (msg) => {
          const text = await decryptOrFallback(msg.content);
          return [msg.id, text] as const;
        }),
      );

      setDecryptedMessages((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    };

    load();
  }, [messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!message.trim() || !selectedConversationId) return;

      await postToApi(`/api/messages/${selectedConversationId}`, {
        content: message,
        messageType: "TEXT",
      });
    },
    onSuccess: async () => {
      setMessage("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversationMessages", selectedConversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });

  const conversations = conversationsQuery.data?.conversations ?? [];
  const activeConversation = conversations.find((conversation) => conversation.id === selectedConversationId);
  const messages = messagesQuery.data ?? [];

  if (conversationsQuery.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
        <Skeleton className="h-[500px]" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
      <Card className="h-[72vh] overflow-hidden bg-white/85">
        <div className="flex items-center justify-between border-b px-4 py-3 text-sm font-medium">
          <span>Conversations</span>
          <Badge variant="outline">{conversationsQuery.data?.totalUnread ?? 0} unread</Badge>
        </div>
        <div className="space-y-1 overflow-y-auto p-2">
          {conversations.length ? (
            conversations.map((conversation) => {
              const counterpart = displayName(conversation.provider.user?.email);
              return (
                <button
                  key={conversation.id}
                  className={`w-full rounded-lg p-3 text-left ${selectedConversationId === conversation.id ? "bg-teal-50" : "hover:bg-rose-50"}`}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{counterpart.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{counterpart}</p>
                      <p className="truncate text-xs text-muted-foreground">{conversation.subject ?? "Consultation follow-up"}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      {conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) : "No messages yet"}
                    </p>
                    {conversation.unreadCount > 0 ? <Badge>{conversation.unreadCount}</Badge> : null}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p className="text-2xl">💬</p>
              <p>No conversations yet. Start from your appointment or provider profile.</p>
              <Button render={<Link href="/patient/appointments" />} variant="outline" className="mt-3">
                View Appointments
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="flex h-[72vh] flex-col overflow-hidden bg-white/85">
        <div className="border-b px-4 py-3 text-sm font-medium">{activeConversation ? displayName(activeConversation.provider.user?.email) : "Chat"}</div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messagesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-44" />
              <Skeleton className="ml-auto h-12 w-52" />
            </div>
          ) : messages.length ? (
            messages.map((chat) => {
              const mine = chat.senderId === user?.id;
              return (
                <div key={chat.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-teal-600 text-white" : "bg-rose-100 text-slate-800"}`}>
                    <p>{decryptedMessages[chat.id] ?? "Decrypting..."}</p>
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? "text-teal-100" : "text-slate-500"}`}>
                      <span>{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}</span>
                      {mine && chat.isRead ? <CheckCheck className="h-3 w-3 text-sky-300" /> : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-2xl">👋</p>
                <p>Select a conversation to start chatting.</p>
              </div>
            </div>
          )}

          {message.trim() ? <p className="text-xs text-muted-foreground">Typing...</p> : null}
        </div>

        <div className="border-t p-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMutation.mutate();
            }}
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a secure message"
              disabled={!selectedConversationId}
            />
            <Button className="bg-teal-600 text-white hover:bg-teal-500" type="submit" disabled={sendMutation.isPending || !selectedConversationId}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
