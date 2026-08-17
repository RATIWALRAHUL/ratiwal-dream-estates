import { NextResponse } from "next/server";
import { siteVisitSchema } from "@/lib/validations/site-visit";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod verification
    const validationResult = siteVisitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid site visit input values",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, phone, email, propertyId, propertyName, preferredDate, preferredTime, numberOfVisitors, message, honeypot } = validationResult.data;

    // Spam honeypot detection
    if (honeypot) {
      // Simulate success for bots
      return NextResponse.json({
        success: true,
        message: "Site visit booked successfully.",
      });
    }

    // Input sanitization and normalization
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanMessage = message?.trim();

    /* =========================================================================
       FUTURE INTEGRATION POINT
       Coordinate site visit schedules with internal spreadsheets (e.g. Google Sheets API), 
       databases, calendar systems, or dispatch notification emails to logistics coordinators.

       Example Calendar/DB Schedule:
       await db.insert(siteVisitsTable).values({
         name: cleanName,
         phone: cleanPhone,
         email: cleanEmail,
         propertyId,
         propertyName,
         visitDate: preferredDate,
         visitTime: preferredTime,
         visitors: numberOfVisitors,
         notes: cleanMessage
       });
       ========================================================================= */

    // Strict privacy rule: Do not output full names or emails to public logs in production
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV ONLY] Site Visit Scheduled:", {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        propertyId,
        propertyName,
        preferredDate,
        preferredTime,
        numberOfVisitors,
        message: cleanMessage,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your site visit request has been recorded. Our team will contact you to coordinate travel logistics.",
    });

  } catch (error) {
    // Secure failure
    console.error("Site Visit API failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
