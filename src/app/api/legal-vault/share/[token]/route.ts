import { NextRequest, NextResponse } from "next/server";
import { LegalShareService } from "@/lib/services/legal-share.service";
import { getStorageProvider } from "@/lib/storage";

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
  } catch (error: any) {
    const status = error?.message?.includes("UNAUTHORIZED")
      ? 401
      : error?.message?.includes("EXPIRED") || error?.message?.includes("LIMIT_REACHED") || error?.message?.includes("REVOKED")
      ? 410
      : 404;

    return NextResponse.json(
      { error: error?.message || "Invalid or inaccessible share link." },
      { status }
    );
  }
}
