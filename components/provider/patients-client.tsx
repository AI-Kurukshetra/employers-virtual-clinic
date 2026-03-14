"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type PatientRow = {
  id: string;
  email: string;
  name: string;
  age: number;
  lastVisit: string;
  activeConditions: string[];
  carePlanStatus: string;
};

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function ProviderPatientsClient() {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<string>("ALL");
  const [carePlanStatus, setCarePlanStatus] = useState<string>("ALL");
  const [lastVisitRange, setLastVisitRange] = useState<string>("ALL");

  const params = useMemo(() => {
    const qp = new URLSearchParams();
    if (search.trim()) qp.set("q", search.trim());
    if (condition !== "ALL") qp.set("condition", condition);
    if (carePlanStatus !== "ALL") qp.set("carePlanStatus", carePlanStatus);

    if (lastVisitRange !== "ALL") {
      const now = new Date();
      const from = new Date(now);
      if (lastVisitRange === "7D") from.setDate(now.getDate() - 7);
      if (lastVisitRange === "30D") from.setDate(now.getDate() - 30);
      if (lastVisitRange === "90D") from.setDate(now.getDate() - 90);
      qp.set("lastVisitFrom", from.toISOString());
      qp.set("lastVisitTo", now.toISOString());
    }

    return qp.toString();
  }, [search, condition, carePlanStatus, lastVisitRange]);

  const patientsQuery = useQuery({
    queryKey: ["provider-patients", params],
    queryFn: () => fetchFromApi<PatientRow[]>(`/api/provider/patients${params ? `?${params}` : ""}`),
  });

  if (patientsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const rows = patientsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-8" placeholder="Search by name, email, condition" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Select value={condition} onValueChange={(v) => setCondition(v ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All conditions</SelectItem>
              <SelectItem value="PCOS">PCOS</SelectItem>
              <SelectItem value="Anxiety">Anxiety</SelectItem>
              <SelectItem value="Fertility">Fertility</SelectItem>
              <SelectItem value="Endometriosis">Endometriosis</SelectItem>
            </SelectContent>
          </Select>

          <Select value={lastVisitRange} onValueChange={(v) => setLastVisitRange(v ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Last visit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any time</SelectItem>
              <SelectItem value="7D">Last 7 days</SelectItem>
              <SelectItem value="30D">Last 30 days</SelectItem>
              <SelectItem value="90D">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={carePlanStatus} onValueChange={(v) => setCarePlanStatus(v ?? "ALL")}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Care plan status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All plans</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On hold</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.length ? (
          rows.map((patient) => (
            <Card key={patient.id} className="bg-white/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{patient.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Age: {patient.age}</p>
                <p>Last visit: {format(new Date(patient.lastVisit), "MMM d, yyyy")}</p>
                <div className="flex flex-wrap gap-1">
                  {patient.activeConditions.length ? patient.activeConditions.map((c) => <Badge key={c} variant="outline">{c}</Badge>) : <Badge variant="outline">No active conditions</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Care plan: {patient.carePlanStatus}</p>
                <Button render={<Link href={`/provider/patients/${patient.id}`} />} size="sm" className="mt-1 w-full bg-teal-600 text-white hover:bg-teal-500">
                  Open Chart
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-white/90"><CardContent className="pt-8 text-center text-sm text-muted-foreground">No patients match your filters.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
