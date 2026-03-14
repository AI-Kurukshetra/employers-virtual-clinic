"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const enrolled = 150;
const rate = 25;
const nextBillingDate = "April 1, 2026";

const invoices = [
  { month: "Mar 2026", amount: 3750, status: "PAID" },
  { month: "Feb 2026", amount: 3725, status: "PAID" },
  { month: "Jan 2026", amount: 3700, status: "PAID" },
  { month: "Dec 2025", amount: 3625, status: "PAID" },
  { month: "Nov 2025", amount: 3600, status: "PAID" },
  { month: "Oct 2025", amount: 3575, status: "PAID" },
];

const plans = [
  { name: "BASIC", price: "$15/emp", border: "border-slate-300", current: false, features: ["Primary care access", "Async consults", "Monthly reporting", "Email support"] },
  { name: "PROFESSIONAL", price: "$25/emp", border: "border-teal-500", current: true, features: ["All Basic features", "Video + chat consults", "Care plans & labs", "Priority support"] },
  { name: "ENTERPRISE", price: "$40/emp", border: "border-slate-300", current: false, features: ["All Professional features", "Dedicated CSM", "Custom integrations", "Quarterly optimization"] },
];

export default function EmployerBillingPage() {
  const [open, setOpen] = useState(false);
  const previewTotal = useMemo(() => enrolled * rate, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef7ff_0%,#f0faf8_52%,#f8fbff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

        <Card className="bg-white/90">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Professional benefits package</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button className="bg-teal-600 text-white hover:bg-teal-500" />}>Change Plan</DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Choose a Plan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 md:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.name} className={`bg-white ${plan.border}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          {plan.current ? <Badge>Current</Badge> : null}
                        </div>
                        <CardDescription>{plan.price}/month</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {plan.features.map((feature) => (
                          <p key={feature} className="text-sm">• {feature}</p>
                        ))}
                        <Button variant={plan.current ? "outline" : "default"} className={plan.current ? "w-full" : "w-full bg-teal-600 text-white hover:bg-teal-500"}>
                          Select
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-3"><p className="text-xs text-muted-foreground">Plan</p><p className="text-lg font-semibold">PROFESSIONAL</p></div>
            <div className="rounded-lg border bg-white p-3"><p className="text-xs text-muted-foreground">Rate</p><p className="text-lg font-semibold">$25/employee/month</p></div>
            <div className="rounded-lg border bg-white p-3"><p className="text-xs text-muted-foreground">Next Billing Date</p><p className="text-lg font-semibold">{nextBillingDate}</p></div>
            <div className="rounded-lg border bg-white p-3"><p className="text-xs text-muted-foreground">Enrolled / Invoice Preview</p><p className="text-lg font-semibold">{enrolled} / ${previewTotal.toLocaleString()}</p></div>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.month}>
                    <TableCell>{invoice.month}</TableCell>
                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge className="bg-emerald-100 text-emerald-800">{invoice.status}</Badge></TableCell>
                    <TableCell><a className="text-sm text-teal-700 underline" href="#">Download PDF</a></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
