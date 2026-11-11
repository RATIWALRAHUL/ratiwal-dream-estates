import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/auth/session";

export interface SeoAccess {
  session: AdminSession;
  /** ADMIN and SUPER_ADMIN may view; only SUPER_ADMIN may verify/sync. */
  allowed: boolean;
  canSync: boolean;
}

/**
 * Server-side authorization for SEO dashboard pages. Unauthenticated users are
 * sent to login; authenticated users without the role see a permission-denied
 * state rather than data. (The middleware is only the first layer.)
 */
export async function getSeoAccess(): Promise<SeoAccess> {
  const session = await getAdminSession();
  if (!session || !session.user.isActive) redirect("/dashboard/login");
  const role = session.user.role;
  return {
    session,
    allowed: role === "ADMIN" || role === "SUPER_ADMIN",
    canSync: role === "SUPER_ADMIN",
  };
}
