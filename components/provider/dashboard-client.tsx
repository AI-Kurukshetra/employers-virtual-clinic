"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarClock, MessageSquare, PlayCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/provider/status-badge";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Analytics = { todayAppointments: number; totalPatients: number; pendingPrescriptions: number; completionRate: number };
type MessageSummary = { totalUnread: number };
type NotificationItem = { id: string; title: string; body: string; createdAt: string; type: string };
type Appointment = {
  id: string;
  status: string;
  type: string;
  scheduledAt: string;
  chiefComplaint?: string | null;
  patient: { id: string; dateOfBirth: string; user: { email: string } };
};

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

const age = (dob: string) => Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)));
const displayName = (email: string) => email.split("@")[0].replace(/[._-]/g, " ");

export function ProviderDashboardClient() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const analyticsQuery = useQuery({
    queryKey: ["provider-analytics"],
    queryFn: () => fetchFromApi<Analytics>("/api/analytics"),
  });

  const appointmentsQuery = useQuery({
    queryKey: ["provider-appointments-today"],
    queryFn: () =>
      fetchFromApi<Appointment[]>(
        `/api/appointments?fromDate=${encodeURIComponent(todayStart.toISOString())}&toDate=${encodeURIComponent(todayEnd.toISOString())}`,
      ),
  });

  const messagesQuery = useQuery({
    queryKey: ["provider-messages-summary"],
    queryFn: () => fetchFromApi<MessageSummary>("/api/messages"),
  });

  const notificationsQuery = useQuery({
    queryKey: ["provider-notifications"],
    queryFn: () => fetchFromApi<NotificationItem[]>("/api/notifications"),
  });

  const todayAppointments = useMemo(
    () => [...(appointmentsQuery.data ?? [])].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [appointmentsQuery.data],
  );

  const queue = todayAppointments.filter((a) => ["IN_PROGRESS", "CONFIRMED"].includes(a.status));
  const recentActivity = (notificationsQuery.data ?? []).slice(0, 10);

  if (analyticsQuery.isLoading || appointmentsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="card-enter overflow-hidden">
        <CardContent className="grid items-center gap-4 py-3 md:grid-cols-[1fr_300px]">
          <div className="space-y-2 py-3">
            <h2 className="text-2xl font-semibold text-slate-900">Clinical Operations Hub</h2>
            <p className="text-sm text-slate-600">Your schedule, queue, and activity are grouped into one streamlined workspace.</p>
          </div>
          <Image
            src="/illustrations/provider-workspace.svg"
            alt="Provider dashboard illustration"
            width={640}
            height={480}
            className="float-gentle hidden h-auto w-full rounded-2xl border border-white/40 bg-white/75 p-2 md:block"
          />
        </CardContent>
      </Card>

      <div className="card-enter grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Today&apos;s appointments</p><p className="mt-1 text-2xl font-semibold">{analyticsQuery.data?.todayAppointments ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total active patients</p><p className="mt-1 text-2xl font-semibold">{analyticsQuery.data?.totalPatients ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pending prescription refills</p><p className="mt-1 text-2xl font-semibold">{analyticsQuery.data?.pendingPrescriptions ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Unread messages</p><p className="mt-1 text-2xl font-semibold">{messagesQuery.data?.totalUnread ?? 0}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="card-enter">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-teal-600" />Today&apos;s Schedule</CardTitle>
            <CardDescription>Timeline of upcoming patient visits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.length ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="relative rounded-xl border border-slate-200 bg-white p-3">
                  <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-teal-400" />
                  <div className="ml-2 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{displayName(appointment.patient.user.email)} • {age(appointment.patient.dateOfBirth)} yrs</p>
                      <Badge variant="outline">{appointment.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.chiefComplaint ?? "No chief complaint provided"}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{format(new Date(appointment.scheduledAt), "h:mm a")}</span>
                      <div className="flex gap-2">
                        <Button render={<Link href={`/provider/consult/${appointment.id}`} />} size="sm" className="bg-cyan-600 text-white hover:bg-cyan-500">
                          <PlayCircle className="mr-1 h-4 w-4" />Start Consultation
                        </Button>
                        <Button render={<Link href={`/provider/patients/${appointment.patient.id}`} />} size="sm" variant="outline">View Chart</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No appointments scheduled today.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="card-enter">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" />Patient Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {queue.length ? queue.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div>
                    <p className="text-sm font-medium">{displayName(q.patient.user.email)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(q.scheduledAt), "h:mm a")}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              )) : <p className="text-sm text-muted-foreground">No joinable patients now.</p>}
            </CardContent>
          </Card>

          <Card className="card-enter">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-violet-600" />Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.length ? recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border p-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{format(new Date(item.createdAt), "MMM d, h:mm a")}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Button render={<Link href="/provider/messages" />} variant="outline" className="hidden">
        <MessageSquare className="mr-1 h-4 w-4" />
        Messages
      </Button>
    </div>
  );
}
