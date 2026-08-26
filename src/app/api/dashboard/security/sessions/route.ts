import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/auth/session";
import { DashboardAuthService } from "@/lib/services/dashboard-auth.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    const sessions = await DashboardAuthService.getActiveSessions(session.user.id, sessionToken);

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
