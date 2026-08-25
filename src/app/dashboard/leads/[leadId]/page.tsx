import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getLeadById } from "@/lib/services/lead.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { LeadDetailView } from "@/components/dashboard/leads/LeadDetailView";
import { Types } from "mongoose";

interface LeadDetailPageProps {
  params: Promise<{ leadId: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
  const { leadId } = await params;
  return {
    title: `Lead Details | Ratiwal Dream Estates`,
    description: `View and manage lead inquiry — Ratiwal Dream Estates advisory pipeline.`,
    robots: { index: false, follow: false },
  };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { leadId } = await params;

  // Validate ID format before DB query
  if (!Types.ObjectId.isValid(leadId)) notFound();

  const { user } = session;
  const lead = await getLeadById(leadId, user.role, user.id);

  if (!lead) notFound();

  // Audit the view asynchronously (best-effort — non-blocking)
  void logAuditEvent({
    actor: user,
    action: "LEAD_VIEWED",
    targetLeadId: new Types.ObjectId(leadId),
  }).catch(() => {/* view audit failure must not break the page */});

  return (
    <LeadDetailView
      lead={lead}
      role={user.role}
      userId={user.id}
    />
  );
}
