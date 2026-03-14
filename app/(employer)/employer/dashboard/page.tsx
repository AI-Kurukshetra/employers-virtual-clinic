"use client";

import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kpis = [
  { label: "Enrolled Employees", value: "150" },
  { label: "Appointments This Month", value: "124" },
  { label: "Top Specialty", value: "OB/GYN" },
  { label: "Avg Satisfaction Score", value: "4.7/5" },
  { label: "Est. Cost Savings", value: "$18,420" },
  { label: "Engagement Rate", value: "81%" },
];

const appointmentsBySpecialty = [
  { month: "Jan", obgyn: 42, endocrinology: 28, mentalHealth: 21 },
  { month: "Feb", obgyn: 51, endocrinology: 33, mentalHealth: 26 },
  { month: "Mar", obgyn: 57, endocrinology: 36, mentalHealth: 31 },
];

const monthlyActiveUsers = [
  { month: "Oct", users: 88 },
  { month: "Nov", users: 95 },
  { month: "Dec", users: 102 },
  { month: "Jan", users: 111 },
  { month: "Feb", users: 126 },
  { month: "Mar", users: 134 },
];

const appointmentTypeSplit = [
  { name: "VIDEO", value: 64, color: "#14b8a6" },
  { name: "CHAT", value: 24, color: "#38bdf8" },
  { name: "ASYNC", value: 12, color: "#94a3b8" },
];

const feed = [
  "Employee #1042 had a Video consult with OB/GYN",
  "Employee #1189 had an Async consult with Endocrinology",
  "Employee #0974 had a Chat consult with Mental Health",
  "Employee #1107 had a Video consult with OB/GYN",
  "Employee #1221 had a Video consult with Endocrinology",
  "Employee #1033 had a Chat consult with Mental Health",
  "Employee #1144 had a Video consult with OB/GYN",
  "Employee #1098 had an Async consult with Mental Health",
  "Employee #1267 had a Video consult with Endocrinology",
  "Employee #1016 had a Chat consult with OB/GYN",
];

export default function EmployerDashboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ddf4ff_0%,#e9fff2_52%,#f7fbff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <Card className="card-enter overflow-hidden">
          <CardContent className="grid items-center gap-4 py-3 md:grid-cols-[1fr_300px]">
            <div className="space-y-2 py-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employer Dashboard</h1>
              <p className="text-sm text-slate-600">A clearer and richer analytics experience for workforce health and engagement.</p>
            </div>
            <Image
              src="/illustrations/employer-insights.svg"
              alt="Employer analytics illustration"
              width={640}
              height={480}
              className="float-gentle hidden h-auto w-full rounded-2xl border border-white/45 bg-white/75 p-2 md:block"
            />
          </CardContent>
        </Card>

        <div className="card-enter grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 text-2xl font-semibold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="card-enter">
            <CardHeader>
              <CardTitle>Appointments by Specialty</CardTitle>
              <CardDescription>Last 3 months</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsBySpecialty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="obgyn" name="OB/GYN" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="endocrinology" name="Endocrinology" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mentalHealth" name="Mental Health" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-enter">
            <CardHeader>
              <CardTitle>Monthly Active Users</CardTitle>
              <CardDescription>6-month trend</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
          <Card className="card-enter">
            <CardHeader>
              <CardTitle>Appointment Type Split</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appointmentTypeSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                    {appointmentTypeSplit.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-2">
                {appointmentTypeSplit.map((item) => (
                  <Badge key={item.name} variant="outline">
                    {item.name}: {item.value}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-enter">
            <CardHeader>
              <CardTitle>Anonymized Activity Feed</CardTitle>
              <CardDescription>Last 10 entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {feed.map((entry, idx) => (
                <div key={`${entry}-${idx}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {entry}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
