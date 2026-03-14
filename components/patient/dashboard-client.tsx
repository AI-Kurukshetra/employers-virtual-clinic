"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { CalendarPlus2, ClipboardPlus, MessageCircleHeart, Pill, Syringe } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSessionUser } from "@/hooks/use-session-user";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Appointment = {
  id: string;
  type: "VIDEO" | "AUDIO" | "CHAT" | "ASYNC";
  status: string;
  scheduledAt: string;
  provider: { specialty?: string; user?: { email?: string } };
};

type SymptomLog = { id: string; date: string; mood: number; energy: number };
type Cycle = { id: string; periodStart: string };
type CarePlan = { id: string };
type Prescription = { id: string; medication: string; refillsRemaining: number; status: string };
type ConversationSummary = { conversations: Array<{ id: string }>; totalUnread: number };

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) {
    throw new Error(json.error ?? "Request failed");
  }
  return json.data;
}

function providerDisplay(appt: Appointment) {
  const email = appt.provider?.user?.email ?? "provider@maven.health";
  return email.split("@")[0].replace(/[._-]/g, " ");
}

export function PatientDashboardClient() {
  const { user } = useSessionUser();

  const todayIso = new Date().toISOString();
  const weekAgo = addDays(new Date(), -7).toISOString();

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "dashboard"],
    queryFn: () => fetchFromApi<Appointment[]>(`/api/appointments?fromDate=${encodeURIComponent(todayIso)}`),
  });

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", "dashboard"],
    queryFn: () => fetchFromApi<SymptomLog[]>(`/api/symptoms?fromDate=${encodeURIComponent(weekAgo)}`),
  });

  const cyclesQuery = useQuery({
    queryKey: ["cycles", "dashboard"],
    queryFn: () => fetchFromApi<Cycle[]>("/api/cycles"),
  });

  const carePlansQuery = useQuery({
    queryKey: ["care-plans", "dashboard"],
    queryFn: () => fetchFromApi<CarePlan[]>("/api/care-plans"),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions", "dashboard"],
    queryFn: () => fetchFromApi<Prescription[]>("/api/prescriptions"),
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations", "dashboard"],
    queryFn: () => fetchFromApi<ConversationSummary>("/api/messages"),
  });

  const upcomingAppointments = useMemo(
    () =>
      (appointmentsQuery.data ?? [])
        .filter((appt) => ["SCHEDULED", "CONFIRMED"].includes(appt.status))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 3),
    [appointmentsQuery.data],
  );

  const moodTrend = useMemo(() => {
    return [...(symptomsQuery.data ?? [])]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        day: format(new Date(item.date), "EEE"),
        mood: item.mood,
        energy: item.energy,
      }));
  }, [symptomsQuery.data]);

  const avgMood = useMemo(() => {
    const source = symptomsQuery.data ?? [];
    if (!source.length) return null;
    const val = source.reduce((sum, item) => sum + item.mood, 0) / source.length;
    return Number(val.toFixed(1));
  }, [symptomsQuery.data]);

  const lastPeriod = cyclesQuery.data?.[0]?.periodStart ? new Date(cyclesQuery.data[0].periodStart) : null;
  const predictedOvulation = lastPeriod ? addDays(lastPeriod, 14) : null;

  const lowRefills = useMemo(
    () => (prescriptionsQuery.data ?? []).filter((p) => p.status === "ACTIVE" && p.refillsRemaining <= 2),
    [prescriptionsQuery.data],
  );

  const name = user?.email ? user.email.split("@")[0] : "there";

  const loading =
    appointmentsQuery.isLoading ||
    symptomsQuery.isLoading ||
    cyclesQuery.isLoading ||
    carePlansQuery.isLoading ||
    prescriptionsQuery.isLoading;

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-28" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="card-enter overflow-hidden">
        <CardContent className="grid items-center gap-4 py-3 md:grid-cols-[1fr_280px]">
          <div className="space-y-2 py-3">
            <h2 className="text-2xl font-semibold text-slate-900">Good morning, {name}</h2>
            <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</p>
            <p className="text-sm text-slate-600">Your wellness snapshot and tasks are ready for today.</p>
          </div>
          <Image
            src="/illustrations/patient-care.svg"
            alt="Patient care overview"
            width={640}
            height={480}
            className="float-gentle hidden h-auto w-full rounded-2xl border border-white/40 bg-white/70 p-2 md:block"
          />
        </CardContent>
      </Card>

      <Card className="card-enter">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your next 3 consultations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingAppointments.length ? (
            upcomingAppointments.map((appt) => (
              <div key={appt.id} className="flex flex-col justify-between gap-3 rounded-xl border border-cyan-100/80 bg-white/85 p-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">Dr. {providerDisplay(appt)}</p>
                  <p className="text-sm text-muted-foreground">{appt.provider.specialty ?? "General care"}</p>
                  <p className="mt-1 text-sm">{format(new Date(appt.scheduledAt), "EEE, MMM d • h:mm a")}</p>
                </div>
                <Button className="bg-cyan-600 text-white hover:bg-cyan-500" size="sm">
                  {appt.type === "VIDEO" ? "Join" : "View"}
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p className="text-2xl">📅</p>
              <p>No appointments yet. Book your first visit.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="card-enter grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/patient/appointments", icon: CalendarPlus2, label: "Book Appointment" },
          { href: "/patient/tracker", icon: ClipboardPlus, label: "Log Symptoms" },
          { href: "/patient/tracker", icon: Syringe, label: "Track Cycle" },
          { href: "/patient/messages", icon: MessageCircleHeart, label: "Message Provider" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Button key={item.label} render={<Link href={item.href} />} className="h-11 bg-white/85 text-slate-700 shadow-sm hover:bg-cyan-50">
              <Icon className="mr-1 h-4 w-4 text-cyan-700" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-enter">
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">Last period date</p>
              <p className="font-medium">{lastPeriod ? format(lastPeriod, "MMM d") : "N/A"}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">Next ovulation</p>
              <p className="font-medium">{predictedOvulation ? format(predictedOvulation, "MMM d") : "N/A"}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">Avg mood this week</p>
              <p className="font-medium">{avgMood ?? "N/A"}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">Active care plans</p>
              <p className="font-medium">{carePlansQuery.data?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enter">
          <CardHeader>
            <CardTitle>Recent Symptom Trends</CardTitle>
            <CardDescription>Mood and energy over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-44">
            {moodTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line dataKey="mood" stroke="#e8799e" strokeWidth={2.2} dot={false} />
                  <Line dataKey="energy" stroke="#14b8a6" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">📈 No trend data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-enter">
        <CardHeader>
          <CardTitle>Upcoming Prescription Refills</CardTitle>
          <CardDescription>Low refill medications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lowRefills.length ? (
            lowRefills.map((prescription) => (
              <div key={prescription.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <div>
                  <p className="font-medium">{prescription.medication}</p>
                  <p className="text-xs text-muted-foreground">{prescription.refillsRemaining} refill(s) remaining</p>
                </div>
                <Button size="sm" variant="outline">
                  <Pill className="mr-1 h-4 w-4" />
                  Request Refill
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p className="text-2xl">💊</p>
              <p>All prescriptions are well stocked.</p>
            </div>
          )}
          {lowRefills.length ? <Badge variant="outline">{lowRefills.length} requiring attention</Badge> : null}
        </CardContent>
      </Card>

      <Button
        render={<Link href="/patient/messages" />}
        className="fixed right-4 bottom-4 z-40 h-11 rounded-full bg-cyan-600 px-4 text-white shadow-lg hover:bg-cyan-500"
      >
        Message
        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{conversationsQuery.data?.totalUnread ?? 0}</span>
      </Button>
    </div>
  );
}
