export type AuditLogEvent = {
  requestId: string;
  method: string;
  path: string;
  userId?: string | null;
  timestamp: string;
  details?: Record<string, unknown>;
};

export function logHipaaAudit(event: AuditLogEvent) {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };
  console.log("[HIPAA_AUDIT]", JSON.stringify(payload));
}
