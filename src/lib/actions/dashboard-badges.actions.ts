"use server";

import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { CustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { OperationalTask } from "@/models/OperationalTask";
import { PartnerLeadSubmission } from "@/models/PartnerLeadSubmission";

export interface DashboardSidebarBadgeCounts {
  leads: number;
  siteVisits: number;
  support: number;
  kyc: number;
  tasks: number;
  partners: number;
}

export async function getDashboardSidebarBadgesAction(): Promise<DashboardSidebarBadgeCounts> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        leads: 0,
        siteVisits: 0,
        support: 0,
        kyc: 0,
        tasks: 0,
        partners: 0,
      };
    }

    await connectToDatabase();

    const [leads, siteVisits, support, kyc, tasks, partners] = await Promise.all([
      Lead.countDocuments({ status: "NEW", abuseStatus: { $ne: "BLOCKED" } }).maxTimeMS(2500).catch(() => 0),
      SiteVisit.countDocuments({ status: "REQUESTED" }).maxTimeMS(2500).catch(() => 0),
      CustomerSupportRequest.countDocuments({ status: "OPEN" }).maxTimeMS(2500).catch(() => 0),
      CustomerKycCase.countDocuments({ status: { $in: ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"] } }).maxTimeMS(2500).catch(() => 0),
      OperationalTask.countDocuments({ status: { $in: ["TO_DO", "IN_PROGRESS", "PENDING_ACCEPTANCE"] } }).maxTimeMS(2500).catch(() => 0),
      PartnerLeadSubmission.countDocuments({ status: "NEW" }).maxTimeMS(2500).catch(() => 0),
    ]);

    return {
      leads,
      siteVisits,
      support,
      kyc,
      tasks,
      partners,
    };
  } catch {
    return {
      leads: 0,
      siteVisits: 0,
      support: 0,
      kyc: 0,
      tasks: 0,
      partners: 0,
    };
  }
}
