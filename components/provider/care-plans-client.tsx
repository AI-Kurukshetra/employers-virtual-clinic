"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Plan = { id: string; title: string; condition: string; status: string; milestones: Record<string, unknown>; startDate: string; patient: { id: string; user: { email: string } } };
type Patient = { id: string; name: string; email: string };

async function fetchFromApi<T>(url: string): Promise<T> { const res = await fetch(url, { credentials: "include" }); const json = (await res.json()) as ApiEnvelope<T>; if (!res.ok || json.error) throw new Error(json.error ?? "Request failed"); return json.data; }
async function postToApi<T>(url: string, body: unknown): Promise<T> { const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const json = (await res.json()) as ApiEnvelope<T>; if (!res.ok || json.error) throw new Error(json.error ?? "Request failed"); return json.data; }
async function patchToApi<T>(url: string, body: unknown): Promise<T> { const res = await fetch(url, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const json = (await res.json()) as ApiEnvelope<T>; if (!res.ok || json.error) throw new Error(json.error ?? "Request failed"); return json.data; }

export function ProviderCarePlansClient() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ patientId: "", condition: "", title: "", goals: [{ text: "", targetDate: "" }], milestones: [{ text: "", dueDate: "", criteria: "" }] });

  const plansQuery = useQuery({ queryKey: ["provider-care-plans"], queryFn: () => fetchFromApi<Plan[]>("/api/care-plans") });
  const patientsQuery = useQuery({ queryKey: ["provider-plan-patients"], queryFn: () => fetchFromApi<Patient[]>("/api/provider/patients") });

  const activePlans = useMemo(() => (plansQuery.data ?? []).filter((p) => p.status === "ACTIVE"), [plansQuery.data]);

  const createPlan = useMutation({
    mutationFn: () => postToApi("/api/care-plans", {
      patientId: form.patientId,
      title: form.title,
      condition: form.condition,
      goals: form.goals.reduce<Record<string, unknown>>((acc, g, i) => ({ ...acc, [`goal_${i + 1}`]: g }), {}),
      milestones: form.milestones.reduce<Record<string, unknown>>((acc, m, i) => ({ ...acc, [`milestone_${i + 1}`]: m }), {}),
      startDate: new Date().toISOString(),
    }),
    onSuccess: async () => {
      setOpen(false);
      setStep(1);
      setForm({ patientId: "", condition: "", title: "", goals: [{ text: "", targetDate: "" }], milestones: [{ text: "", dueDate: "", criteria: "" }] });
      await queryClient.invalidateQueries({ queryKey: ["provider-care-plans"] });
    },
  });

  const completeMilestone = useMutation({
    mutationFn: (payload: { planId: string; key: string }) => patchToApi(`/api/care-plans/${payload.planId}`, { milestoneKey: payload.key, completed: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["provider-care-plans"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Active Care Plans</CardTitle>
          <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />New Care Plan</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {activePlans.map((plan) => (
            <button key={plan.id} className="w-full rounded-lg border p-3 text-left" onClick={() => setSelectedPlan(plan)}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{plan.title}</p>
                <Badge variant="outline">{plan.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{plan.condition} • {plan.patient.user.email.split("@")[0].replace(/[._-]/g, " ")}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full max-w-[620px] overflow-y-auto" side="right">
          <SheetHeader><SheetTitle>Care Plan Builder</SheetTitle><SheetDescription>Step {step} of 4</SheetDescription></SheetHeader>
          <div className="space-y-4 p-4">
            {step === 1 ? (
              <div className="space-y-3">
                <Select value={form.patientId} onValueChange={(v) => setForm((f) => ({ ...f, patientId: v ?? "" }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select patient" /></SelectTrigger><SelectContent>{(patientsQuery.data ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                <Input placeholder="Condition" value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} />
                <Input placeholder="Plan title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-2">
                {form.goals.map((goal, idx) => (
                  <div key={`goal-${idx}`} className="grid gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_160px_auto]">
                    <Input placeholder="Goal text" value={goal.text} onChange={(e) => setForm((f) => ({ ...f, goals: f.goals.map((g, i) => i === idx ? { ...g, text: e.target.value } : g) }))} />
                    <Input type="date" value={goal.targetDate} onChange={(e) => setForm((f) => ({ ...f, goals: f.goals.map((g, i) => i === idx ? { ...g, targetDate: e.target.value } : g) }))} />
                    <Button variant="outline" onClick={() => setForm((f) => ({ ...f, goals: f.goals.filter((_, i) => i !== idx) }))}>Remove</Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setForm((f) => ({ ...f, goals: [...f.goals, { text: "", targetDate: "" }] }))}>Add Goal</Button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-2">
                {form.milestones.map((m, idx) => (
                  <div key={`mile-${idx}`} className="space-y-2 rounded-lg border p-2">
                    <Input placeholder="Milestone" value={m.text} onChange={(e) => setForm((f) => ({ ...f, milestones: f.milestones.map((x, i) => i === idx ? { ...x, text: e.target.value } : x) }))} />
                    <Input type="date" value={m.dueDate} onChange={(e) => setForm((f) => ({ ...f, milestones: f.milestones.map((x, i) => i === idx ? { ...x, dueDate: e.target.value } : x) }))} />
                    <Textarea placeholder="Completion criteria" value={m.criteria} onChange={(e) => setForm((f) => ({ ...f, milestones: f.milestones.map((x, i) => i === idx ? { ...x, criteria: e.target.value } : x) }))} />
                    <Button variant="outline" onClick={() => setForm((f) => ({ ...f, milestones: f.milestones.filter((_, i) => i !== idx) }))}>Remove</Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setForm((f) => ({ ...f, milestones: [...f.milestones, { text: "", dueDate: "", criteria: "" }] }))}>Add Milestone</Button>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{form.title}</p>
                <p>{form.condition}</p>
                <p className="mt-2 text-muted-foreground">Goals: {form.goals.length} • Milestones: {form.milestones.length}</p>
              </div>
            ) : null}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
              {step < 4 ? <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</Button> : <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => createPlan.mutate()} disabled={createPlan.isPending}>Submit Care Plan</Button>}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(selectedPlan)} onOpenChange={(v) => !v && setSelectedPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedPlan?.title}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {selectedPlan ? Object.entries((selectedPlan.milestones ?? {}) as Record<string, unknown>).map(([key, value]) => {
              const row = value as { text?: string; dueDate?: string; criteria?: string; completed?: boolean };
              return (
                <div key={key} className="flex items-start justify-between rounded-lg border p-2">
                  <div>
                    <p className="font-medium">{row.text ?? key}</p>
                    <p className="text-xs text-muted-foreground">Due: {row.dueDate ? format(new Date(row.dueDate), "MMM d, yyyy") : "-"}</p>
                    <p className="text-xs text-muted-foreground">Criteria: {row.criteria ?? "-"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => selectedPlan && completeMilestone.mutate({ planId: selectedPlan.id, key })}>Mark Complete</Button>
                </div>
              );
            }) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
