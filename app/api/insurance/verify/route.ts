import { NextRequest } from "next/server";
import { insuranceVerifySchema } from "@/lib/validations";
import { jsonError, jsonOk } from "@/lib/utils";
import { requireSession } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireSession();
    if (error) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsedBody = insuranceVerifySchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError("Invalid input", 422, { issues: parsedBody.error.flatten() });
    }

    return jsonOk(
      {
        eligible: true,
        copay: 25,
        deductible: 800,
        coverageType: "PPO",
      },
      {
        memberId: parsedBody.data.memberId,
        groupNumber: parsedBody.data.groupNumber,
        insuranceProvider: parsedBody.data.insuranceProvider,
      },
    );
  } catch (e) {
    return jsonError("Failed to verify insurance", 500, { details: String(e) });
  }
}
