import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getImageKitAuthParams } from "@/lib/imagekit/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AuthenticationError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/media/auth
 * Generates temporary ImageKit upload signature for authorized administrative sessions.
 */
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session || !session.user.isActive) {
      throw new AuthenticationError("Admin session required to request media upload tokens");
    }

    const authParams = getImageKitAuthParams();

    return successResponse(authParams);
  } catch (error: any) {
    return errorResponse(error);
  }
}
