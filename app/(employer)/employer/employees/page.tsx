"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type EmployeeRow = {
  id: string;
  email: string;
  enrolledDate: string;
  lastActive: string;
  status: "ACTIVE" | "INACTIVE";
};

const initialEmployees: EmployeeRow[] = [
  { id: "emp-001", email: "julia@acme.com", enrolledDate: "2025-10-02", lastActive: "2026-03-13", status: "ACTIVE" },
  { id: "emp-002", email: "jordan@acme.com", enrolledDate: "2025-10-11", lastActive: "2026-03-12", status: "ACTIVE" },
  { id: "emp-003", email: "joan@acme.com", enrolledDate: "2025-10-28", lastActive: "2026-02-21", status: "INACTIVE" },
  { id: "emp-004", email: "jasmine@acme.com", enrolledDate: "2025-11-04", lastActive: "2026-03-10", status: "ACTIVE" },
  { id: "emp-005", email: "jared@acme.com", enrolledDate: "2025-11-14", lastActive: "2026-03-11", status: "ACTIVE" },
  { id: "emp-006", email: "jane@acme.com", enrolledDate: "2025-12-01", lastActive: "2026-01-29", status: "INACTIVE" },
];

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  return `${local[0]}***@${domain}`;
};

export default function EmployerEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>(initialEmployees);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [inviteText, setInviteText] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeCount = useMemo(() => employees.filter((e) => e.status === "ACTIVE").length, [employees]);

  const sendInvites = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/employers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: inviteText }),
      });
      setInviteOpen(false);
      setInviteText("");
    } finally {
      setSubmitting(false);
    }
  };

  const removeEmployee = () => {
    if (!selectedEmployee) return;
    setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
    setSelectedEmployee(null);
    setRemoveOpen(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef7ff_0%,#f0faf8_52%,#f8fbff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger render={<Button className="bg-teal-600 text-white hover:bg-teal-500" />}>Invite Employees</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Employees</DialogTitle>
              </DialogHeader>
              <Textarea value={inviteText} onChange={(e) => setInviteText(e.target.value)} placeholder="jane@acme.com, alex@acme.com" rows={5} />
              <DialogFooter>
                <Button onClick={sendInvites} disabled={submitting || !inviteText.trim()} className="bg-teal-600 text-white hover:bg-teal-500">
                  {submitting ? "Sending..." : "Send Invites"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Enrolled Employees ({employees.length}) • Active ({activeCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{maskEmail(employee.email)}</TableCell>
                    <TableCell>{employee.enrolledDate}</TableCell>
                    <TableCell>{employee.lastActive}</TableCell>
                    <TableCell>
                      <Badge className={employee.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setRemoveOpen(true);
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Employee</DialogTitle>
            </DialogHeader>
            <p className="text-sm">Are you sure you want to remove {selectedEmployee ? maskEmail(selectedEmployee.email) : "this employee"}?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Button>
              <Button className="bg-rose-600 text-white hover:bg-rose-500" onClick={removeEmployee}>Confirm Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
