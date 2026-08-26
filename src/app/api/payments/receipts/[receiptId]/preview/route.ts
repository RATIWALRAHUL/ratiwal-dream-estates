import { NextRequest, NextResponse } from "next/server";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
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
