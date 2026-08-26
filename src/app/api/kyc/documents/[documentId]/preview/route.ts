import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { PermissionService } from "@/lib/services/permission.service";
import { KycDocumentService } from "@/lib/services/kyc-document.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const hasPerm = await PermissionService.userHasPermission(session.user, "KYC_VIEW");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { documentId } = await params;
    const url = new URL(request.url);
    const versionNumber = url.searchParams.get("v") ? Number(url.searchParams.get("v")) : undefined;

    const access = await KycDocumentService.authorizeDocumentAccess({
      documentId,
      versionNumber,
      session,
    });

    // In production, stream or redirect to signed temporary S3/ImageKit URL with no-store headers
    return NextResponse.json({
      success: true,
      documentId,
      filename: access.filename,
      mimeType: access.mimeType,
      message: "Document access authorized. Storage stream ready.",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
