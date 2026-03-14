import { ProviderScheduleClient } from "@/components/provider/schedule-client";
import { ProviderShell } from "@/components/provider/provider-shell";

export default function ProviderSchedulePage() {
  return (
    <ProviderShell title="Schedule & Availability">
      <ProviderScheduleClient />
    </ProviderShell>
  );
}
