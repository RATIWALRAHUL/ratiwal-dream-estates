import "server-only";
import { AuthenticationError, AuthorizationError } from "@/lib/api/errors";
import { getAdminSession, type AdminRole, type AdminSession } from "./session";

/**
 * Validates that the current request has an active, authenticated admin session.
 * Optionally verifies that the admin has one of the required roles.
 * 
 * Throws AuthenticationError if not authenticated or session expired.
 * Throws AuthorizationError if authenticated but role is insufficient.
 */
export async function requireAdminSession(allowedRoles?: AdminRole[]): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new AuthenticationError("Admin authentication required to access the dashboard.");
  }

  if (!session.user.isActive) {
    throw new AuthorizationError("Your admin account is inactive or has been suspended.");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.user.role)) {
      throw new AuthorizationError(
        `Insufficient permissions. Required role: ${allowedRoles.join(" or ")} (Current: ${session.user.role})`
      );
    }
  }

  return session;
}

/**
 * Checks if the current user is an authenticated admin without throwing an error.
 */
export async function checkAdminSession(allowedRoles?: AdminRole[]): Promise<AdminSession | null> {
  try {
    return await requireAdminSession(allowedRoles);
  } catch {
    return null;
  }
}

/**
 * Validates that the active session has a specific granular permission from the catalogue.
 */
export async function requirePermission(permissionKey: string): Promise<AdminSession> {
  const session = await requireAdminSession();

  if (session.user.role === "SUPER_ADMIN") {
    return session;
  }

  const { PermissionService } = await import("@/lib/services/permission.service");
  const hasPerm = await PermissionService.userHasPermission(session.user, permissionKey);

  if (!hasPerm) {
    throw new AuthorizationError(
      `Permission denied. Missing required permission: ${permissionKey}`
    );
  }

  return session;
}

