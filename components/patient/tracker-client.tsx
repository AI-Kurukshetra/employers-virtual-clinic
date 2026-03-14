"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type SymptomLog = { id: string; date: string; mood: number; energy: number; pain: number; sleep: number };
type Cycle = { id: string; periodStart: string; periodEnd: string | null; cycleLength: number | null; flow: "LIGHT" | "MEDIUM" | "HEAVY" };

const symptomTags = ["cramps", "bloating", "headache", "fatigue", "nausea", "spotting", "breast tenderness"];

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

function moodColor(mood?: number) {
  if (!mood) return "bg-slate-100";
  if (mood <= 3) return "bg-rose-200";
  if (mood <= 6) return "bg-rose-300";
  if (mood <= 8) return "bg-teal-300";
  return "bg-teal-400";
}

export function PatientTrackerClient() {
  const queryClient = useQueryClient();

  const [mood, setMood] = useState([6]);
  const [energy, setEnergy] = useState([6]);
  const [pain, setPain] = useState([2]);
  const [sleep, setSleep] = useState("8");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toSliderArray = (value: number | readonly number[]) => (Array.isArray(value) ? [...value] : [value]);

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", "tracker"],
    queryFn: () => fetchFromApi<SymptomLog[]>("/api/symptoms"),
  });

  const cyclesQuery = useQuery({
    queryKey: ["cycles", "tracker"],
    queryFn: () => fetchFromApi<Cycle[]>("/api/cycles"),
  });

  const logSymptomsMutation = useMutation({
    mutationFn: async () => {
      await postToApi("/api/symptoms", {
        date: new Date().toISOString(),
        symptoms: { selectedTags },
        mood: mood[0],
        energy: energy[0],
        sleep: Number(sleep),
        pain: pain[0],
        notes,
      });
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setNotes("");
      setSelectedTags([]);
      await queryClient.invalidateQueries({ queryKey: ["symptoms", "tracker"] });
    },
    onError: (error) => setErrorMessage(error instanceof Error ? error.message : "Could not log symptom"),
  });

  const markPeriodStartMutation = useMutation({
    mutationFn: () =>
      postToApi("/api/cycles", {
        periodStart: new Date().toISOString(),
        flow: "MEDIUM",
        symptoms: [],
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cycles", "tracker"] });
    },
  });

  const markPeriodEndMutation = useMutation({
    mutationFn: async () => {
      const latest = cyclesQuery.data?.[0];
      if (!latest) throw new Error("No cycle found to close");

      await postToApi("/api/cycles", {
        periodStart: latest.periodStart,
        periodEnd: new Date().toISOString(),
        flow: latest.flow,
        symptoms: [],
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cycles", "tracker"] });
    },
    onError: (error) => setErrorMessage(error instanceof Error ? error.message : "Could not update cycle"),
  });

  const last14Days = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of symptomsQuery.data ?? []) {
      map.set(new Date(log.date).toDateString(), log.mood);
    }

    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(new Date(), -13 + i);
      return {
        date,
        mood: map.get(date.toDateString()),
      };
    });
  }, [symptomsQuery.data]);

  const averageCycleLength = useMemo(() => {
    const lengths = (cyclesQuery.data ?? []).flatMap((c) => (c.cycleLength ? [c.cycleLength] : []));
    if (!lengths.length) return 28;
    return Math.round(lengths.reduce((sum, l) => sum + l, 0) / lengths.length);
  }, [cyclesQuery.data]);

  const latestCycleStart = cyclesQuery.data?.[0]?.periodStart ? new Date(cyclesQuery.data[0].periodStart) : new Date();
  const predictedNextPeriod = addDays(latestCycleStart, averageCycleLength);
  const predictedOvulationStart = addDays(predictedNextPeriod, -14);
  const predictedOvulationEnd = addDays(predictedOvulationStart, 2);

  const menstruationDates = useMemo(() => {
    const results: Date[] = [];
    const latest = cyclesQuery.data?.[0];
    if (!latest) return results;
    const start = new Date(latest.periodStart);
    const end = latest.periodEnd ? new Date(latest.periodEnd) : addDays(start, 4);

    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
      results.push(new Date(date));
    }
    return results;
  }, [cyclesQuery.data]);

  const ovulationWindowDates = useMemo(() => {
    const dates: Date[] = [];
    for (let d = new Date(predictedOvulationStart); d <= predictedOvulationEnd; d = addDays(d, 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }, [predictedOvulationStart, predictedOvulationEnd]);

  if (symptomsQuery.isLoading || cyclesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="symptoms" className="space-y-4">
      <TabsList variant="default">
        <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
        <TabsTrigger value="cycle">Cycle</TabsTrigger>
      </TabsList>

      <TabsContent value="symptoms">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Log Symptoms</CardTitle>
              <CardDescription>Track today&apos;s health signals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Mood: {mood[0]}</p>
                <Slider min={1} max={10} step={1} value={mood} onValueChange={(value) => setMood(toSliderArray(value))} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Energy: {energy[0]}</p>
                <Slider min={1} max={10} step={1} value={energy} onValueChange={(value) => setEnergy(toSliderArray(value))} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Pain: {pain[0]}</p>
                <Slider min={0} max={10} step={1} value={pain} onValueChange={(value) => setPain(toSliderArray(value))} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Sleep (hours)</p>
                <Input value={sleep} onChange={(e) => setSleep(e.target.value)} type="number" min={0} max={24} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {symptomTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs ${active ? "border-teal-500 bg-teal-50 text-teal-700" : "bg-white"}`}
                        onClick={() => {
                          setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" />

              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

              <Button className="w-full bg-teal-600 text-white hover:bg-teal-500" onClick={() => logSymptomsMutation.mutate()}>
                {logSymptomsMutation.isPending ? "Saving..." : "Submit log"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Mood Heatmap</CardTitle>
              <CardDescription>Last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {last14Days.map((entry) => (
                  <div key={entry.date.toISOString()} className="flex flex-col items-center gap-1">
                    <div className={`h-9 w-9 rounded-md ${moodColor(entry.mood)}`} />
                    <span className="text-[10px] text-muted-foreground">{format(entry.date, "d")}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Lighter = lower mood, teal = higher mood.</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="cycle">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Cycle Tracking</CardTitle>
              <CardDescription>Stay ahead with predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="bg-rose-500 text-white hover:bg-rose-400" onClick={() => markPeriodStartMutation.mutate()}>
                  {markPeriodStartMutation.isPending ? "Saving..." : "Period started today"}
                </Button>
                <Button variant="outline" onClick={() => markPeriodEndMutation.mutate()}>
                  {markPeriodEndMutation.isPending ? "Saving..." : "Period ended today"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-xl border bg-white p-3 text-sm">
                <p>
                  <span className="font-medium">Predicted next period:</span> {format(predictedNextPeriod, "MMM d, yyyy")}
                </p>
                <p>
                  <span className="font-medium">Predicted ovulation window:</span> {format(predictedOvulationStart, "MMM d")} - {format(predictedOvulationEnd, "MMM d")}
                </p>
                <p>
                  <span className="font-medium">Average cycle length:</span> {averageCycleLength} days
                </p>
              </div>

              <Calendar
                mode="single"
                className="rounded-xl border bg-white"
                modifiers={{
                  menstruation: menstruationDates,
                  ovulation: ovulationWindowDates,
                  predicted: [predictedNextPeriod],
                }}
                modifiersClassNames={{
                  menstruation: "bg-rose-200 text-rose-900 rounded-md",
                  ovulation: "bg-teal-200 text-teal-900 rounded-md",
                  predicted: "bg-slate-200 text-slate-900 rounded-md",
                }}
              />

              <div className="flex gap-2 text-xs">
                <Badge className="bg-rose-200 text-rose-900">Menstruation</Badge>
                <Badge className="bg-teal-200 text-teal-900">Ovulation</Badge>
                <Badge className="bg-slate-200 text-slate-900">Predicted</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/85">
            <CardHeader>
              <CardTitle>Last 6 Cycles</CardTitle>
              <CardDescription>Recent cycle history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(cyclesQuery.data ?? []).slice(0, 6).length ? (
                (cyclesQuery.data ?? []).slice(0, 6).map((cycle) => (
                  <div key={cycle.id} className="rounded-lg border bg-white p-3">
                    <p className="font-medium">{format(new Date(cycle.periodStart), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">
                      {cycle.periodEnd ? `${format(new Date(cycle.periodEnd), "MMM d, yyyy")}` : "Ongoing"}
                    </p>
                    <p className="text-xs text-muted-foreground">Cycle length: {cycle.cycleLength ?? "N/A"} days</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <p className="text-2xl">🌸</p>
                  <p>No cycle logs yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
