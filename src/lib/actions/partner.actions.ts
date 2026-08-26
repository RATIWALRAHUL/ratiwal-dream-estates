"use server";

import { revalidatePath } from "next/cache";
import { requirePartnerSession } from "@/lib/auth/partner-session";
import { PartnerLeadService } from "@/lib/services/partner-lead.service";
import { PartnerGuard } from "@/lib/auth/partner-guard";
import { PartnerInvoice } from "@/models/PartnerInvoice";
import { PartnerAccount } from "@/models/PartnerAccount";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerActionResult } from "./partner-auth.actions";

export async function submitPartnerLeadAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requirePartnerSession();

    const propertyId = formData.get("propertyId")?.toString()?.trim();
    const clientName = formData.get("clientName")?.toString()?.trim();
    const clientPhone = formData.get("clientPhone")?.toString()?.trim();
    const clientEmail = formData.get("clientEmail")?.toString()?.trim() || undefined;
    const budgetBand = formData.get("budgetBand")?.toString()?.trim() || undefined;
    const investmentIntent = formData.get("investmentIntent")?.toString() as any;
    const notes = formData.get("notes")?.toString()?.trim() || undefined;
    const consentConfirmed = formData.get("consentConfirmed") === "true" || formData.get("consentConfirmed") === "on";

    if (!propertyId || !clientName || !clientPhone) {
      return { success: false, error: "Please fill in all mandatory fields: property, client name, and phone number." };
    }

    if (!consentConfirmed) {
      return { success: false, error: "You must confirm that you hold client consent to register this inquiry." };
    }

    const { submission, statusMessage } = await PartnerLeadService.submitLead(session, {
      propertyId,
      clientName,
      clientPhone,
      clientEmail,
      budgetBand,
      investmentIntent,
      notes,
      consentConfirmed: true,
    });

    revalidatePath("/partner");
    revalidatePath("/partner/leads");

    return {
      success: true,
      data: {
        submissionId: submission._id.toString(),
        submissionNumber: submission.submissionNumber,
        message: statusMessage,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit lead." };
  }
}

export async function uploadPartnerInvoiceAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requirePartnerSession();
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const invoiceNumber = formData.get("invoiceNumber")?.toString()?.trim();
    const invoiceDateStr = formData.get("invoiceDate")?.toString()?.trim();
    const taxableAmountPaise = parseInt(formData.get("taxableAmountPaise")?.toString() || "0", 10);
    const totalInvoiceAmountPaise = parseInt(formData.get("totalInvoiceAmountPaise")?.toString() || "0", 10);
    const documentKey = formData.get("documentKey")?.toString()?.trim();

    if (!invoiceNumber || !invoiceDateStr || !documentKey || totalInvoiceAmountPaise <= 0) {
      return { success: false, error: "Please provide valid invoice details and uploaded document." };
    }

    const invoice = await PartnerInvoice.create({
      invoiceNumber,
      partnerId: scope.partnerId,
      invoiceDate: new Date(invoiceDateStr),
      taxableAmountPaise,
      totalInvoiceAmountPaise,
      documentKey,
      status: "SUBMITTED",
    });

    revalidatePath("/partner/commissions");
    revalidatePath("/partner/documents");

    return { success: true, data: { invoiceId: invoice._id.toString() } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit invoice." };
  }
}

export async function updatePartnerPreferencesAction(formData: FormData): Promise<PartnerActionResult> {
  try {
    const session = await requirePartnerSession();
    await connectToDatabase();

    const email = formData.get("emailNotif") === "true";
    const sms = formData.get("smsNotif") === "true";
    const whatsapp = formData.get("whatsappNotif") === "true";

    await PartnerAccount.findByIdAndUpdate(session.user.id, {
      $set: {
        "notificationPreferences.email": email,
        "notificationPreferences.sms": sms,
        "notificationPreferences.whatsapp": whatsapp,
      },
    });

    revalidatePath("/partner/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update preferences." };
  }
}
