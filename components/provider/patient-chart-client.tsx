"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/provider/status-badge";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type PatientChart = {
  id: string;
  dateOfBirth: string;
  phoneNumber: string;
  allergies: string[];
  medications: string[];
  insuranceProvider?: string | null;
  insuranceId?: string | null;
  emergencyContact: Record<string, unknown>;
  user: { email: string };
  appointments: Array<{ id: string; status: string; type: string; scheduledAt: string; notes?: string | null; chiefComplaint?: string | null }>;
  symptomLogs: Array<{ id: string; date: string; mood: number; energy: number; pain: number }>;
  cycleTracks: Array<{ id: string; periodStart: string; periodEnd?: string | null; cycleLength?: number | null; flow: string }>;
  prescriptions: Array<{ id: string; medication: string; status: string; refillsRemaining: number; createdAt: string }>;
  labResults: Array<{ id: string; testName: string; testCode: string; status: string; orderedAt: string; resultedAt?: string | null }>;
  carePlans: Array<{ id: string; title: string; condition: string; status: string; startDate: string; endDate?: string | null }>;
  mentalHealthAssessments: Array<{ id: string; assessmentType: string; score: number; severity: string; completedAt: string }>;
};

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

const nameFromEmail = (email: string) => email.split("@")[0].replace(/[._-]/g, " ");

export function PatientChartClient({ patientId }: { patientId: string }) {
  const query = useQuery({
    queryKey: ["provider-patient-chart", patientId],
    queryFn: () => fetchFromApi<PatientChart>(`/api/provider/patients/${patientId}`),
  });

  const data = query.data;

  const symptomSeries = useMemo(
    () =>
      (data?.symptomLogs ?? []).map((row) => ({
        day: format(new Date(row.date), "MMM d"),
        mood: row.mood,
        energy: row.energy,
        pain: row.pain,
      })),
    [data?.symptomLogs],
  );

  const cycleSeries = useMemo(
    () =>
      (data?.cycleTracks ?? []).map((row) => ({
        day: format(new Date(row.periodStart), "MMM d"),
        cycleLength: row.cycleLength ?? 0,
      })),
    [data?.cycleTracks],
  );

  if (query.isLoading) {
    return <Skeleton className="h-[640px]" />;
  }

  if (!data) {
    return <Card className="bg-white/90"><CardContent className="pt-8 text-center text-sm text-muted-foreground">Unable to load patient chart.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>{nameFromEmail(data.user.email)} • {Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} yrs</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="w-full overflow-x-auto" variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
          <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-white/90"><CardContent className="grid gap-3 pt-6 md:grid-cols-2">
            <p><span className="font-medium">Email:</span> {data.user.email}</p>
            <p><span className="font-medium">Phone:</span> {data.phoneNumber}</p>
            <p><span className="font-medium">Insurance:</span> {data.insuranceProvider ?? "N/A"}</p>
            <p><span className="font-medium">Member ID:</span> {data.insuranceId ?? "N/A"}</p>
            <p><span className="font-medium">Allergies:</span> {data.allergies.join(", ") || "None listed"}</p>
            <p><span className="font-medium">Current meds:</span> {data.medications.join(", ") || "None listed"}</p>
            <p className="md:col-span-2"><span className="font-medium">Emergency contact:</span> {JSON.stringify(data.emergencyContact)}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="bg-white/90"><CardContent className="pt-4">
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Complaint</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader><TableBody>
              {data.appointments.map((a) => <TableRow key={a.id}><TableCell>{format(new Date(a.scheduledAt), "MMM d, yyyy h:mm a")}</TableCell><TableCell><Badge variant="outline">{a.type}</Badge></TableCell><TableCell><StatusBadge status={a.status} /></TableCell><TableCell>{a.chiefComplaint ?? "-"}</TableCell><TableCell>{a.notes ?? "-"}</TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card className="bg-white/90"><CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={symptomSeries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area type="monotone" dataKey="mood" stroke="#ec4899" fill="#f9a8d4" /><Area type="monotone" dataKey="energy" stroke="#14b8a6" fill="#99f6e4" /><Area type="monotone" dataKey="pain" stroke="#f97316" fill="#fdba74" /></AreaChart></ResponsiveContainer>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cycles">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="bg-white/90"><CardContent className="h-72 pt-6">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={cycleSeries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="cycleLength" stroke="#0ea5e9" strokeWidth={2} /></LineChart></ResponsiveContainer>
            </CardContent></Card>
            <Card className="bg-white/90"><CardContent className="pt-4"><Table><TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Length</TableHead><TableHead>Flow</TableHead></TableRow></TableHeader><TableBody>
              {data.cycleTracks.map((c) => <TableRow key={c.id}><TableCell>{format(new Date(c.periodStart), "MMM d, yyyy")}</TableCell><TableCell>{c.periodEnd ? format(new Date(c.periodEnd), "MMM d, yyyy") : "-"}</TableCell><TableCell>{c.cycleLength ?? "-"}</TableCell><TableCell>{c.flow}</TableCell></TableRow>)}
            </TableBody></Table></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card className="bg-white/90"><CardContent className="pt-4"><Table><TableHeader><TableRow><TableHead>Medication</TableHead><TableHead>Status</TableHead><TableHead>Refills</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>
            {data.prescriptions.map((p) => <TableRow key={p.id}><TableCell>{p.medication}</TableCell><TableCell><StatusBadge status={p.status} /></TableCell><TableCell>{p.refillsRemaining}</TableCell><TableCell>{format(new Date(p.createdAt), "MMM d, yyyy")}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card className="bg-white/90"><CardContent className="pt-4"><Table><TableHeader><TableRow><TableHead>Test</TableHead><TableHead>Code</TableHead><TableHead>Status</TableHead><TableHead>Ordered</TableHead><TableHead>Resulted</TableHead></TableRow></TableHeader><TableBody>
            {data.labResults.map((l) => <TableRow key={l.id}><TableCell>{l.testName}</TableCell><TableCell>{l.testCode}</TableCell><TableCell><StatusBadge status={l.status} /></TableCell><TableCell>{format(new Date(l.orderedAt), "MMM d, yyyy")}</TableCell><TableCell>{l.resultedAt ? format(new Date(l.resultedAt), "MMM d, yyyy") : "-"}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="care-plans">
          <Card className="bg-white/90"><CardContent className="pt-4"><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Condition</TableHead><TableHead>Status</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead></TableRow></TableHeader><TableBody>
            {data.carePlans.map((cp) => <TableRow key={cp.id}><TableCell>{cp.title}</TableCell><TableCell>{cp.condition}</TableCell><TableCell><StatusBadge status={cp.status} /></TableCell><TableCell>{format(new Date(cp.startDate), "MMM d, yyyy")}</TableCell><TableCell>{cp.endDate ? format(new Date(cp.endDate), "MMM d, yyyy") : "-"}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="mental-health">
          <Card className="bg-white/90"><CardContent className="pt-4"><Table><TableHeader><TableRow><TableHead>Assessment</TableHead><TableHead>Score</TableHead><TableHead>Severity</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>
            {data.mentalHealthAssessments.map((m) => <TableRow key={m.id}><TableCell>{m.assessmentType}</TableCell><TableCell>{m.score}</TableCell><TableCell>{m.severity}</TableCell><TableCell>{format(new Date(m.completedAt), "MMM d, yyyy")}</TableCell></TableRow>)}
          </TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
