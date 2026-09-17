import { NextRequest, NextResponse } from "next/server";
import { LegalShareService } from "@/lib/services/legal-share.service";
import { getStorageProvider } from "@/lib/storage";

import { getErrorMessage } from "@/lib/api/errors";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const passcode = searchParams.get("passcode") || undefined;

    const { share, document, version } = await LegalShareService.validateAndAccessShare(token, passcode);

    const provider = getStorageProvider();
    const download = await provider.createPrivateDownload({
      assetId: version._id.toString(),
      providerKey: version.providerKey,
      ttlSeconds: 300,
    });

    return NextResponse.redirect(download.signedUrl, {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    const status = getErrorMessage(error)?.includes("UNAUTHORIZED")
      ? 401
      : getErrorMessage(error)?.includes("EXPIRED") || getErrorMessage(error)?.includes("LIMIT_REACHED") || getErrorMessage(error)?.includes("REVOKED")
      ? 410
      : 404;

    return NextResponse.json(
      { error: getErrorMessage(error, "Invalid or inaccessible share link.") },
      { status }
    );
  }
}
