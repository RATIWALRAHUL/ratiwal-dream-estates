import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validations/enquiry";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod verification
    const validationResult = enquirySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid enquiry input values",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, phone, email, preferredLocation, propertyType, budget, message, propertyId, propertySlug, honeypot } = validationResult.data;

    // Spam honeypot detection
    if (honeypot) {
      // Return a simulated success code so bots think it went through
      return NextResponse.json({
        success: true,
        message: "Enquiry logged successfully.",
      });
    }

    // Input sanitization and normalization
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    /* =========================================================================
       FUTURE INTEGRATION POINT
       This is where you would connect your database (e.g. Prisma, Drizzle) 
       and your email provider (e.g. Resend, SendGrid) or CRM (e.g. HubSpot).
       
       Example DB Insert:
       await db.insert(enquiriesTable).values({
         name: cleanName,
         phone: cleanPhone,
         email: cleanEmail,
         location: preferredLocation,
         type: propertyType,
         budget,
         message: cleanMessage,
         propertyId,
         propertySlug
       });

       Example Email Send:
       await mailer.send({
         to: process.env.ENQUIRY_RECEIVER_EMAIL,
         subject: `New Plot Enquiry: ${cleanName}`,
         body: `Contact details: ...`
       });
       ========================================================================= */

    // Strict privacy rule: Do not output full names or emails to public logs in production
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV ONLY] Lead Captured:", {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        preferredLocation,
        propertyType,
        budget,
        message: cleanMessage,
        propertyId,
        propertySlug,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been submitted. A Ratiwal consultant will contact you shortly.",
    });

  } catch (error) {
    // Fail securely, do not leak backend stack traces
    console.error("Enquiry API failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
