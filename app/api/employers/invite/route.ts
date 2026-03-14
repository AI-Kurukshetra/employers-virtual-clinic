import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { jsonError, jsonOk } from "@/lib/utils";

const inviteSchema = z.object({
  emails: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireSession(["EMPLOYER_ADMIN"]);
    if (error || !session) return error;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid input", 422, { issues: parsed.error.flatten() });
    }

    const emails = parsed.data.emails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!emails.length) return jsonError("No valid emails provided", 422);

    await prisma.notification.createMany({
      data: emails.map((email) => ({
        userId: session.user.id,
        type: "EMPLOYEE_INVITE",
        title: "Employee Invite Created",
        body: `Invite queued for ${email}`,
        metadata: { email, employerId: session.user.employerId ?? null },
        sentAt: new Date(),
      })),
    });

    for (const email of emails) {
      console.log("Mock invite email sent", { email, employerAdminId: session.user.id, employerId: session.user.employerId ?? null });
    }

    return jsonOk({ invited: emails.length, emails }, { count: emails.length }, 201);
  } catch (e) {
    return jsonError("Failed to send invites", 500, { details: String(e) });
  }
}
