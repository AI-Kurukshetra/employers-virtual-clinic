import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function requireSession(roles?: Role[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: jsonError("Unauthorized", 401), session: null };
  }

  if (roles && roles.length > 0 && !roles.includes(session.user.role)) {
    return { error: jsonError("Forbidden", 403), session: null };
  }

  return { error: null, session };
}
