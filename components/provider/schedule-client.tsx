"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSessionUser } from "@/hooks/use-session-user";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Appointment = { id: string; scheduledAt: string; duration: number; patient: { user: { email: string } }; status: string };
type Provider = { id: string; availability: Record<string, unknown> };

type DayConfig = { enabled: boolean; start: string; end: string; slotDuration: string };

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

async function fetchFromApi<T>(url: string): Promise<T> { const res = await fetch(url, { credentials: "include" }); const json = (await res.json()) as ApiEnvelope<T>; if (!res.ok || json.error) throw new Error(json.error ?? "Request failed"); return json.data; }
async function patchToApi<T>(url: string, body: unknown): Promise<T> { const res = await fetch(url, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const json = (await res.json()) as ApiEnvelope<T>; if (!res.ok || json.error) throw new Error(json.error ?? "Request failed"); return json.data; }

const defaultConfig: Record<string, DayConfig> = Object.fromEntries(days.map((d) => [d, { enabled: d !== "saturday" && d !== "sunday", start: "09:00", end: "17:00", slotDuration: "30" }]));

export function ProviderScheduleClient() {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const [blockedDates, setBlockedDates] = useState("");
  const [config, setConfig] = useState<Record<string, DayConfig>>(defaultConfig);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const appointmentsQuery = useQuery({
    queryKey: ["provider-schedule-appointments"],
    queryFn: () => fetchFromApi<Appointment[]>(`/api/appointments?fromDate=${encodeURIComponent(weekStart.toISOString())}&toDate=${encodeURIComponent(weekEnd.toISOString())}`),
  });

  const providerQuery = useQuery({
    queryKey: ["provider-profile", user?.providerId],
    enabled: Boolean(user?.providerId),
    queryFn: () => fetchFromApi<Provider>(`/api/providers/${user?.providerId}`),
  });

  useEffect(() => {
    const availability = providerQuery.data?.availability as Record<string, Array<{ start: string; end: string; slotDuration?: number }>> | undefined;
    if (!availability) return;

    const next: Record<string, DayConfig> = { ...defaultConfig };
    for (const day of days) {
      const slots = availability[day];
      if (Array.isArray(slots) && slots.length > 0) {
        next[day] = {
          enabled: true,
          start: slots[0].start,
          end: slots[0].end,
          slotDuration: String(slots[0].slotDuration ?? 30),
        };
      } else {
        next[day] = { ...next[day], enabled: false };
      }
    }

    const blocked = availability.blockedDates as unknown as string[] | undefined;
    if (blocked?.length) setBlockedDates(blocked.join(","));
    setConfig(next);
  }, [providerQuery.data?.availability]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.providerId) throw new Error("Provider profile missing");

      const availability = days.reduce<Record<string, unknown>>((acc, day) => {
        const row = config[day];
        acc[day] = row.enabled ? [{ start: row.start, end: row.end, slotDuration: Number(row.slotDuration) }] : [];
        return acc;
      }, {});

      availability.blockedDates = blockedDates
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      return patchToApi(`/api/providers/${user.providerId}`, { availability });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["provider-profile", user?.providerId] });
    },
  });

  const grouped = useMemo(() => {
    const byDay = new Map<string, Appointment[]>();
    for (let i = 0; i < 7; i += 1) byDay.set(format(addDays(weekStart, i), "yyyy-MM-dd"), []);

    for (const appointment of appointmentsQuery.data ?? []) {
      const key = format(new Date(appointment.scheduledAt), "yyyy-MM-dd");
      byDay.set(key, [...(byDay.get(key) ?? []), appointment]);
    }

    return byDay;
  }, [appointmentsQuery.data, weekStart]);

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardHeader><CardTitle>Weekly Calendar</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const list = grouped.get(key) ?? [];
            return (
              <div key={key} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{format(day, "EEE, MMM d")}</p>
                <div className="mt-2 space-y-2">
                  {list.length ? list.map((a) => <div key={a.id} className="rounded-md bg-blue-50 px-2 py-1 text-xs"><p>{format(new Date(a.scheduledAt), "h:mm a")}</p><p className="text-muted-foreground">{a.patient.user.email.split("@")[0].replace(/[._-]/g, " ")}</p></div>) : <p className="text-xs text-muted-foreground">No appointments</p>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-white/90">
        <CardHeader><CardTitle>Set Availability</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {days.map((day) => (
            <div key={day} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[120px_auto_auto_auto_130px] md:items-center">
              <p className="text-sm font-medium capitalize">{day}</p>
              <div className="flex items-center gap-2"><Switch checked={config[day].enabled} onCheckedChange={(v) => setConfig((c) => ({ ...c, [day]: { ...c[day], enabled: Boolean(v) } }))} /><span className="text-xs text-muted-foreground">Enabled</span></div>
              <Input type="time" value={config[day].start} disabled={!config[day].enabled} onChange={(e) => setConfig((c) => ({ ...c, [day]: { ...c[day], start: e.target.value } }))} />
              <Input type="time" value={config[day].end} disabled={!config[day].enabled} onChange={(e) => setConfig((c) => ({ ...c, [day]: { ...c[day], end: e.target.value } }))} />
              <Select value={config[day].slotDuration} onValueChange={(v) => setConfig((c) => ({ ...c, [day]: { ...c[day], slotDuration: v ?? "30" } }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Slot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Blocked dates (comma separated YYYY-MM-DD)</p>
            <Input value={blockedDates} onChange={(e) => setBlockedDates(e.target.value)} placeholder="2026-03-30,2026-04-01" />
          </div>

          <Button className="w-full bg-teal-600 text-white hover:bg-teal-500" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save Availability</Button>
        </CardContent>
      </Card>
    </div>
  );
}
