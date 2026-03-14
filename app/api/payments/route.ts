import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error } = await requireSession();
    if (error) return error;

    return jsonOk(
      {
        checkout: "/api/payments/checkout",
        webhook: "/api/payments/webhook",
      },
      { message: "Use explicit payment endpoints" },
    );
  } catch (e) {
    return jsonError("Failed to load payment endpoints", 500, { details: String(e) });
  }
}
