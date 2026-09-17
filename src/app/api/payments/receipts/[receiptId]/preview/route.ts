import { NextRequest, NextResponse } from "next/server";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";
import { PaymentReceipt } from "@/models/PaymentReceipt";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/session";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalGuard } from "@/lib/auth/portal-guard";

export const dynamic = "force-dynamic";

function htmlError(message: string, status: number): NextResponse {
  return new NextResponse(`<html><body><h3>${message}</h3></body></html>`, {
    status,
    headers: { "Content-Type": "text/html" },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;

    await connectToDatabase();
    const receipt = await PaymentReceipt.findById(receiptId).select("bookingId").lean();
    if (!receipt) {
      return htmlError("Receipt Not Found", 404);
    }

    // This link is shared by both the admin dashboard and the customer portal,
    // so either a valid admin session or the owning customer's session (scoped
    // to the specific booking this receipt belongs to) is required. Previously
    // this route had no authentication at all — anyone who knew a receiptId
    // could view another customer's name, booking number, and amount.
    const adminSession = await getAdminSession();
    if (!adminSession) {
      const customerSession = await getCustomerSession();
      if (!customerSession) {
        return htmlError("Sign in required to view this receipt.", 401);
      }
      try {
        await PortalGuard.assertCustomerBookingAccess(customerSession, receipt.bookingId as unknown as string);
      } catch {
        return htmlError("You do not have permission to view this receipt.", 403);
      }
    }

    const html = await PaymentReceiptService.renderReceiptHtml(receiptId);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    return new NextResponse(
      `<html><body><h3>Receipt Not Found</h3><p>${(error as Error).message}</p></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  }
}
