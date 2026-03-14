import { Badge } from "@/components/ui/badge";

const map: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-700",
  NO_SHOW: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={map[status] ?? ""}>{status}</Badge>;
}
