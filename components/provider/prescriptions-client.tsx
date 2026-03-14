"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/provider/status-badge";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Prescription = { id: string; medication: string; status: string; refillsRemaining: number; createdAt: string; patient: { id: string; user: { email: string } } };
type Patient = { id: string; name: string; email: string };

const meds = ["Metformin", "Sertraline", "Levothyroxine", "Progesterone", "Ibuprofen", "Prenatal Vitamin"];

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function postToApi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

const name = (email: string) => email.split("@")[0].replace(/[._-]/g, " ");

export function ProviderPrescriptionsClient() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("ALL");
  const [medicationFilter, setMedicationFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);

  const [form, setForm] = useState({ patientId: "", medication: "", dosage: "", frequency: "", refills: "1", pharmacyName: "", instructions: "", startDate: "", endDate: "" });

  const prescriptionsQuery = useQuery({ queryKey: ["provider-prescriptions"], queryFn: () => fetchFromApi<Prescription[]>("/api/prescriptions") });
  const patientsQuery = useQuery({ queryKey: ["provider-patient-options"], queryFn: () => fetchFromApi<Patient[]>("/api/provider/patients") });

  const filtered = useMemo(() => (prescriptionsQuery.data ?? []).filter((p) => {
    if (status !== "ALL" && p.status !== status) return false;
    if (patientFilter !== "ALL" && p.patient.id !== patientFilter) return false;
    if (medicationFilter.trim() && !p.medication.toLowerCase().includes(medicationFilter.toLowerCase())) return false;
    return true;
  }), [prescriptionsQuery.data, status, patientFilter, medicationFilter]);

  const createMutation = useMutation({
    mutationFn: () => postToApi("/api/prescriptions", {
      patientId: form.patientId,
      medication: form.medication,
      dosage: form.dosage,
      frequency: form.frequency,
      refills: Number(form.refills),
      pharmacyName: form.pharmacyName,
      instructions: form.instructions,
      startDate: form.startDate || new Date().toISOString(),
      endDate: form.endDate || undefined,
    }),
    onSuccess: async () => {
      setSheetOpen(false);
      setForm({ patientId: "", medication: "", dosage: "", frequency: "", refills: "1", pharmacyName: "", instructions: "", startDate: "", endDate: "" });
      await queryClient.invalidateQueries({ queryKey: ["provider-prescriptions"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-4">
          <Select value={status} onValueChange={(v) => setStatus(v ?? "ALL")}><SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent></Select>
          <Input placeholder="Medication name" value={medicationFilter} onChange={(e) => setMedicationFilter(e.target.value)} />
          <Select value={patientFilter} onValueChange={(v) => setPatientFilter(v ?? "ALL")}><SelectTrigger className="w-full"><SelectValue placeholder="Patient" /></SelectTrigger><SelectContent><SelectItem value="ALL">All patients</SelectItem>{(patientsQuery.data ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
          <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={() => setSheetOpen(true)}><Plus className="mr-1 h-4 w-4" />New Prescription</Button>
        </CardContent>
      </Card>

      <Card className="bg-white/90">
        <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Medication</TableHead><TableHead>Patient</TableHead><TableHead>Status</TableHead><TableHead>Refills</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((p) => <TableRow key={p.id}><TableCell>{p.medication}</TableCell><TableCell>{name(p.patient.user.email)}</TableCell><TableCell><StatusBadge status={p.status} /></TableCell><TableCell>{p.refillsRemaining}</TableCell><TableCell>{format(new Date(p.createdAt), "MMM d, yyyy")}</TableCell></TableRow>)}
          </TableBody></Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-[560px] overflow-y-auto" side="right">
          <SheetHeader><SheetTitle>New Prescription</SheetTitle><SheetDescription>Create and issue medication order</SheetDescription></SheetHeader>
          <div className="space-y-3 p-4">
            <Select value={form.patientId} onValueChange={(v) => setForm((f) => ({ ...f, patientId: v ?? "" }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select patient" /></SelectTrigger><SelectContent>{(patientsQuery.data ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.email})</SelectItem>)}</SelectContent></Select>
            <Input list="common-meds" placeholder="Medication" value={form.medication} onChange={(e) => setForm((f) => ({ ...f, medication: e.target.value }))} />
            <datalist id="common-meds">{meds.map((m) => <option key={m} value={m} />)}</datalist>
            <Input placeholder="Dosage" value={form.dosage} onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))} />
            <Input placeholder="Frequency" value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} />
            <Input type="number" min={0} max={5} placeholder="Refills (0-5)" value={form.refills} onChange={(e) => setForm((f) => ({ ...f, refills: e.target.value }))} />
            <Input placeholder="Pharmacy name + address" value={form.pharmacyName} onChange={(e) => setForm((f) => ({ ...f, pharmacyName: e.target.value }))} />
            <Textarea placeholder="Instructions" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <Button className="w-full bg-teal-600 text-white hover:bg-teal-500" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Submit Prescription</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
