export function UtilizationCard({ title, amount }: { title: string; amount: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-semibold">{amount}</p>
    </div>
  );
}
